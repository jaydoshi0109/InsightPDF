"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
  prefetch?: boolean;
}
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(({ 
  href, 
  children, 
  className,
  exact = false,
  prefetch = false,
  ...props 
}, ref) => {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Only run on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Update active state when pathname changes
  useEffect(() => {
    if (!isMounted) return;
    const active = exact 
      ? pathname === href 
      : href === '/' 
        ? pathname === href 
        : pathname.startsWith(href);
    setIsActive(active);
  }, [pathname, href, exact, isMounted]);
  // Don't render anything during SSR or before hydration
  if (!isMounted) {
    return (
      <span 
        className={cn(
          "inline-block w-16 h-6 bg-slate-800 rounded-md animate-pulse",
          className
        )}
        aria-hidden="true"
      />
    );
  }
  return (
    <Link
      href={href}
      ref={ref}
      className={cn(
        "text-sm font-medium transition-colors duration-200",
        "hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md",
        isActive 
          ? "text-indigo-400" 
          : "text-slate-300 hover:bg-slate-800/50 px-2 py-1",
        className
      )}
      aria-current={isActive ? 'page' : undefined}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
});
NavLink.displayName = "NavLink";
export default NavLink;
