"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

export type TabsVariant = "segmented" | "underline" | "compact";

const TabsVariantContext = React.createContext<TabsVariant>("segmented");

const tabsListVariants = cva(
  "flex items-center gap-0 outline-none",
  {
    variants: {
      variant: {
        segmented:
          "w-full min-h-0 h-auto flex-wrap sm:flex-nowrap justify-start rounded-xl border border-gray-200/80 bg-gray-100/80 p-1 shadow-sm gap-1 overflow-x-auto [scrollbar-width:thin]",
        underline:
          "w-full justify-start gap-0 bg-transparent border-b border-gray-200 rounded-none p-0 h-auto min-h-0",
        compact:
          "inline-flex w-fit max-w-full flex-nowrap justify-start rounded-xl border border-gray-200/80 bg-white p-1 shadow-sm gap-0.5 overflow-x-auto [scrollbar-width:thin]",
      },
    },
    defaultVariants: { variant: "segmented" },
  }
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        segmented:
          "flex-1 min-w-[6rem] sm:min-w-0 rounded-lg border border-transparent px-3 py-2.5 text-gray-600 hover:bg-white/60 hover:text-gray-900 data-[state=active]:border-gray-200/90 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm sm:px-4",
        underline:
          "flex-none rounded-none border-b-2 border-transparent -mb-px px-4 py-3.5 text-gray-500 hover:text-gray-800 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none sm:px-5",
        compact:
          "h-9 shrink-0 rounded-lg border border-transparent px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-blue-50/80 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200/60 data-[state=active]:shadow-sm sm:px-5",
      },
    },
    defaultVariants: { variant: "segmented" },
  }
);

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: TabsVariant;
};

function Tabs({ className, variant = "segmented", ...props }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-variant={variant}
        className={cn("flex flex-col gap-3", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

function TabsList({ className, variant: variantProp, ...props }: TabsListProps) {
  const ctxVariant = React.useContext(TabsVariantContext);
  const variant = variantProp ?? ctxVariant;
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>;

function TabsTrigger({
  className,
  variant: variantProp,
  ...props
}: TabsTriggerProps) {
  const ctxVariant = React.useContext(TabsVariantContext);
  const variant = variantProp ?? ctxVariant;
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
