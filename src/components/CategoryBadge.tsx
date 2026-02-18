import { VideoCategory, CATEGORY_COLORS } from "@/types/video";

interface CategoryBadgeProps {
  category: VideoCategory;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`${CATEGORY_COLORS[category]} ${sizeClass} rounded-full font-medium text-primary-foreground tracking-wide uppercase`}
    >
      {category}
    </span>
  );
}
