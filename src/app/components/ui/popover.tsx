"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "./utils";

// More aggressive Figma prop filter
const cleanProps = <T extends Record<string, any>>(props: T): Partial<T> => {
  const cleaned: any = {};
  for (const key in props) {
    // Skip all _fg props (case insensitive check) - more patterns
    if (!key.match(/^_fg/i) && !key.startsWith('_fg')) {
      cleaned[key] = props[key];
    }
  }
  return cleaned;
};

const Popover = PopoverPrimitive.Root;

function PopoverTrigger(
  { children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>
) {
  const filtered = cleanProps(props);
  
  // If asChild is true and children exist, also clean the children's props
  if (filtered.asChild && children && React.isValidElement(children)) {
    const childProps = cleanProps(children.props || {});
    const cleanedChild = React.cloneElement(children, childProps as any);
    return <PopoverPrimitive.Trigger {...filtered}>{cleanedChild}</PopoverPrimitive.Trigger>;
  }
  
  return <PopoverPrimitive.Trigger {...filtered}>{children}</PopoverPrimitive.Trigger>;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const filtered = cleanProps(props);
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...filtered}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor(
  props: React.ComponentProps<typeof PopoverPrimitive.Anchor>
) {
  const filtered = cleanProps(props);
  return <PopoverPrimitive.Anchor {...filtered} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };