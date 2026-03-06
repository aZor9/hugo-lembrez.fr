interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div className={`glass ${hover ? "glass-hover" : ""} p-6 ${className}`}>
      {children}
    </div>
  );
}
