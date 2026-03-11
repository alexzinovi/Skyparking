"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "./utils";

// More aggressive Figma prop filter
const cleanProps = <T extends Record<string, any>>(props: T): Partial<T> => {
  const cleaned: any = {};
  for (const key in props) {
    // Skip all _fg props (case insensitive check)
    if (!key.match(/^_fg/i)) {
      cleaned[key] = props[key];
    }
  }
  return cleaned;
};

const Popover = PopoverPrimitive.Root;

function PopoverTrigger(
  props: React.ComponentProps<typeof PopoverPrimitive.Trigger>
) {
  const filtered = cleanProps(props);
  return <PopoverPrimitive.Trigger {...filtered} />;
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