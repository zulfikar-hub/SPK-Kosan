"use client";

import React, { ReactNode, FC, useState } from "react";

/* ======================================================
   Accordion (Root)
====================================================== */

interface AccordionProps {
  children: ReactNode;
  className?: string;
  type?: "single" | "multiple";
  collapsible?: boolean;
}

export const Accordion: FC<AccordionProps> = ({
  children,
  className,
  type = "single",
  collapsible = true,
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    if (type === "single") {
      if (openItems.includes(value)) {
        if (collapsible) setOpenItems([]);
      } else {
        setOpenItems([value]);
      }
    } else {
      setOpenItems((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
  };

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<AccordionItemProps>(child)) {
      return React.cloneElement(child, {
        openItems,
        toggleItem,
      });
    }
    return child;
  });

  return <div className={className}>{enhancedChildren}</div>;
};

/* ======================================================
   Accordion Item
====================================================== */

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
  openItems?: string[];
  toggleItem?: (value: string) => void;
}

export const AccordionItem: FC<AccordionItemProps> = ({
  children,
  value,
  className,
  openItems = [],
  toggleItem,
}) => {
  const isOpen = openItems.includes(value);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<AccordionItemChildProps>(child)) {
      return React.cloneElement(child, {
        isOpen,
        value,
        toggleItem,
      });
    }
    return child;
  });

  return <div className={className}>{enhancedChildren}</div>;
};

/* ======================================================
   Shared props untuk Trigger & Content
====================================================== */

interface AccordionItemChildProps {
  isOpen?: boolean;
  value?: string;
  toggleItem?: (value: string) => void;
}

/* ======================================================
   Accordion Trigger
====================================================== */

interface AccordionTriggerProps extends AccordionItemChildProps {
  children: ReactNode;
  className?: string;
}

export const AccordionTrigger: FC<AccordionTriggerProps> = ({
  children,
  className,
  value,
  toggleItem,
}) => {
  return (
    <button
      type="button"
      onClick={() => value && toggleItem?.(value)}
      className={className}
    >
      {children}
    </button>
  );
};

/* ======================================================
   Accordion Content
====================================================== */

interface AccordionContentProps extends AccordionItemChildProps {
  children: ReactNode;
  className?: string;
}

export const AccordionContent: FC<AccordionContentProps> = ({
  children,
  className,
  isOpen,
}) => {
  if (!isOpen) return null;
  return <div className={className}>{children}</div>;
};
