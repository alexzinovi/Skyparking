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
  const users = await kv.getByPrefix("user:");
  
  if (users.length === 0) {
    const adminId = generateUserId();
    const adminUser: User = {
      id: adminId,
      username: "sandeparking",
      passwordHash: hashPassword("Sashoepichaga98!"),
      fullName: "System Administrator",
      email: "admin@skyparking.bg",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`user:${adminId}`, adminUser);
    await kv.set(`username:sandeparking`, adminId); // Username -> ID mapping
    
    console.log("Created initial admin user: sandeparking");
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
      username: userData.username,
      passwordHash: hashPassword(userData.password),
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy
    };
    
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
      return { success: false, message: "Потребителят не е намерен" };
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
    const [userId, timestamp, hash] = token.split(":");
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    // Verify hash
    const data = `${userId}:${timestamp}`;
    const expectedHash = createHash("sha256").update(data + "skyparking_secret_key").digest("hex");
    if (hash !== expectedHash) {
      return null;
    }
    
    const user = await getUserById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Verify session token error:", error);
    return null;
  }
}