"use client";

import * as React from "react";
import Image from "next/image";
import "./cat.css";
import { cn } from "@/lib/utils";

interface CatProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const CatSizes = {
  small: 100,
  medium: 180,
  large: 220,
};

function useIsDark() {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function Cat({ size = "large", className }: CatProps) {
  const isDark = useIsDark();
  const px = CatSizes[size];

  const filter = isDark
    ? "brightness(0.85) contrast(1.15) saturate(1.2)"
    : "brightness(0.75) contrast(1.1) saturate(1.1)";

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      <Image
        src="/geniuspro-cat.svg"
        alt="GeniusPro"
        width={px}
        height={px}
        className="object-contain"
        style={{ filter }}
        priority
      />
    </div>
  );
}
