import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return formatDate(dateString);
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-accent-primary text-white";
    case "high":
      return "bg-accent-secondary text-black";
    case "moderate":
      return "bg-yellow-500 text-black";
    case "low":
      return "bg-accent-success text-black";
    default:
      return "bg-gray-500 text-white";
  }
}

export function getDisasterIcon(type: string): string {
  switch (type) {
    case "cyclone":
      return "🌪️";
    case "flood":
      return "🌊";
    case "earthquake":
      return "🌍";
    case "fire":
      return "🔥";
    case "drought":
      return "🏜️";
    case "storm":
      return "⛈️";
    default:
      return "⚠️";
  }
}
