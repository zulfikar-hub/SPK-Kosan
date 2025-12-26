import { cn } from "@/lib/utils"
import React from "react" 

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        "bg-gradient-to-r from-muted to-muted/50 via-muted/90",
        "bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }