import * as kv from "./kv_store.tsx";
import { createHash } from "node:crypto";

// User roles and their permissions
export const ROLES = {
  admin: {
    name: "Администратор",
    permissions: ["view_bookings", "edit_bookings", "delete_bookings", "manage_users", "view_capacity", "force_accept"]
  },
  manager: {
    name: "Мениджър",
    permissions: ["view_bookings", "edit_bookings", "view_capacity", "force_accept"]
  },
  operator: {
    name: "Оператор",
    permissions: ["view_bookings", "edit_bookings", "view_capacity"]
  }
};

export type UserRole = keyof typeof ROLES;

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
}

// Hash password using SHA-256
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Generate user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create initial admin user if none exists
export async function ensureAdminUser() {
  console.log("🔧 Ensuring admin user exists...");
  
  // FIRST: Clean up any null/invalid users before doing anything else
  await cleanupInvalidUsers();
  
  // THEN: Check if sandeparking user already exists via username mapping
  const existingSandeparking = await kv.get("username:sandeparking");
  if (existingSandeparking) {
    console.log("✅ Admin user 'sandeparking' already exists with ID:", existingSandeparking);
    // Verify the user record actually exists
    const userRecord = await kv.get(`user:${existingSandeparking}`);
    if (userRecord) {
      console.log("✅ User record verified");
      return;
    } else {
      console.log("⚠️ Username mapping exists but user record missing, will recreate");
      // Clean up orphaned mapping
      await kv.del("username:sandeparking");
    }
  }
  
  // Get all users to check count
  const users = await kv.getByPrefix("user:");
  console.log("Found", users.length, "existing users");
  
  // Check if admin user with old credentials exists and needs migration
  const oldAdminId = await kv.get("username:admin");
  if (oldAdminId) {
    console.log("Found old admin user, updating credentials...");
    const oldAdmin = await kv.get(`user:${oldAdminId}`) as User;
    if (oldAdmin) {
      // Delete old username mapping
      await kv.del("username:admin");
      
      // Update user with new credentials
      oldAdmin.username = "sandeparking";
      oldAdmin.passwordHash = hashPassword("Sashoepichaga98!");
      
      // Save with new username mapping
      await kv.set(`user:${oldAdmin.id}`, oldAdmin);
      await kv.set("username:sandeparking", oldAdmin.id);
      
      console.log("✅ Migrated old admin user to new credentials: sandeparking");
      return;
    }
  }
  
  // Only create new admin if NO users exist at all
  if (users.length === 0) {
    console.log("No users found, creating initial admin...");
    const adminId = generateUserId();
    const adminUser: User = {
      id: adminId,
      username: "sandeparking",
      passwordHash: hashPassword("Sashoepichaga98!"),
      fullName: "System Administrator",
      email: "admin@skyparking.bg",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: "System"
    };
    
    await kv.set(`user:${adminId}`, adminUser);
    await kv.set(`username:sandeparking`, adminId);
    
    console.log("✅ Created initial admin user: sandeparking with ID:", adminId);
  } else {
    console.log("⚠️ Users exist but no sandeparking user found - this shouldn't happen");
    console.log("⚠️ NOT creating duplicate admin to prevent issues");
    console.log("⚠️ Please check your user records manually or delete all users to recreate");
  }
}

// Clean up invalid users (called on server startup)
async function cleanupInvalidUsers(): Promise<void> {
  try {
    const allUsers = await kv.getByPrefix("user:");
    
    const invalidUsers = allUsers.filter(user => {
      // Invalid if no username or empty username
      if (!user.username || user.username.trim() === '') {
        return true;
      }
      // Invalid if user is inactive AND was created by system (no createdBy field)
      if (!user.isActive && !user.createdBy) {
        return true;
      }
      return false;
    });
    
    if (invalidUsers.length === 0) {
      console.log("✅ No invalid users found during startup cleanup");
      return;
    }
    
    console.log(`🧹 Found ${invalidUsers.length} invalid users, cleaning up...`);
    
    for (const user of invalidUsers) {
      try {
        console.log(`🗑️ Deleting invalid user: ID=${user.id}, username="${user.username || '(empty)'}"`);
        
        // Delete user record
        await kv.del(`user:${user.id}`);
        
        // Delete username mapping if it exists
        if (user.username && user.username.trim() !== '') {
          await kv.del(`username:${user.username}`);
        }
        
        console.log(`✅ Deleted invalid user: ${user.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete invalid user ${user.id}:`, error);
      }
    }
    
    console.log(`✅ Startup cleanup complete: removed ${invalidUsers.length} invalid users`);
  } catch (error) {
    console.error("❌ Startup cleanup error:", error);
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const userIdKey = await kv.get(`username:${username}`);
    if (!userIdKey) {
      return null;
    }
    
    const user = await kv.get(`user:${userIdKey}`) as User;
    if (!user || !user.isActive) {
      return null;
    }
    
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return null;
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    await kv.set(`user:${user.id}`, user);
    
    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const users = await kv.getByPrefix("user:");
  return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  return await kv.get(`user:${userId}`) as User | null;
}

// Create new user
export async function createUser(userData: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
}, createdBy: string): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    // CRITICAL: Validate that username is not null/undefined/empty
    if (!userData.username || userData.username.trim() === '') {
      console.error("❌ Attempted to create user with invalid username:", userData.username);
      return { success: false, message: "Потребителското име е задължително" };
    }
    
    // Validate password
    if (!userData.password || userData.password.trim() === '') {
      console.error("❌ Attempted to create user with invalid password");
      return { success: false, message: "Паролата е задължителна" };
    }
    
    // Validate fullName
    if (!userData.fullName || userData.fullName.trim() === '') {
      console.error("❌ Attempted to create user with invalid fullName");
      return { success: false, message: "Пълното име е задължително" };
    }
    
    // Validate email
    if (!userData.email || userData.email.trim() === '') {
      console.error("❌ Attempted to create user with invalid email");
      return { success: false, message: "Имейлът е задължителен" };
    }
    
    // Check if username already exists
    const existingUserId = await kv.get(`username:${userData.username}`);
    if (existingUserId) {
      return { success: false, message: "Потребителското име вече съществува" };
    }
    
    // Validate role
    if (!ROLES[userData.role]) {
      return { success: false, message: "Невалидна роля" };
    }
    
    const userId = generateUserId();
    const user: User = {
      id: userId,
      username: userData.username.trim(),
      passwordHash: hashPassword(userData.password),
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
      role: userData.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy
    };
    
    console.log(`✅ Creating new user: ${user.username} (${user.role}) by ${createdBy}`);
    
    await kv.set(`user:${userId}`, user);
    await kv.set(`username:${userData.username}`, userId);
    
    return { success: true, user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, message: "Грешка при създаване на потребител" };
  }
}

// Update user
export async function updateUser(
  userId: string,
  updates: {
    fullName?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    password?: string;
  }
): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, message: "Потребитлят не е намерен" };
    }
    
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined && ROLES[updates.role]) user.role = updates.role;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.password !== undefined) user.passwordHash = hashPassword(updates.password);
    
    await kv.set(`user:${userId}`, user);
    
    return { success: true, user };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Грешка при обновяване на потребител" };
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, message: "Потребителят не е намерен" };
    }
    
    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter(u => u.role === "admin" && u.isActive).length;
      if (adminCount <= 1) {
        return { success: false, message: "Не може да изтриете последния администратор" };
      }
    }
    
    await kv.del(`user:${userId}`);
    await kv.del(`username:${user.username}`);
    
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Грешка при изтриване на потребител" };
  }
}

// Check if user has permission
export function hasPermission(user: User, permission: string): boolean {
  return ROLES[user.role]?.permissions.includes(permission) || false;
}

// Verify session token (simple token = userId:timestamp:hash)
export function createSessionToken(user: User): string {
  const timestamp = Date.now();
  const data = `${user.id}:${timestamp}`;
  const hash = createHash("sha256").update(data + "skyparking_secret_key").digest("hex");
  return `${user.id}:${timestamp}:${hash}`;
}

export async function verifySessionToken(token: string): Promise<User | null> {
  try {
    console.log("🔍 Verifying token:", token?.substring(0, 50) + "...");
    const [userId, timestamp, hash] = token.split(":");
    console.log("Token parts:", { userId, timestamp: timestamp ? "present" : "missing", hash: hash ? "present" : "missing" });
    
    if (!userId || !timestamp || !hash) {
      console.log("❌ Token format invalid - missing parts");
      return null;
    }
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      console.log("❌ Token expired");
      return null;
    }
    
    // Verify hash
    const data = `${userId}:${timestamp}`;
    const expectedHash = createHash("sha256").update(data + "skyparking_secret_key").digest("hex");
    if (hash !== expectedHash) {
      console.log("❌ Token hash mismatch");
      return null;
    }
    
    const user = await getUserById(userId);
    if (!user || !user.isActive) {
      console.log("❌ User not found or inactive");
      return null;
    }
    
    console.log("✅ Token verified successfully for user:", user.username);
    return user;
  } catch (error) {
    console.error("Verify session token error:", error);
    return null;
  }
}