import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles,
  Trophy
} from 'lucide-react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 1000, prefix = '', suffix = '', className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (change * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return Math.round(val).toString();
  };

  return (
    <span className={`number-animate ${isAnimating ? '' : ''} ${className}`}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  showPercentage = true, 
  animated = true,
  color = 'blue',
  size = 'md'
}: ProgressBarProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentValue(value);
    }
  }, [value, animated]);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const actualPercentage = Math.round((currentValue / max) * 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{actualPercentage}%</span>
          )}
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div 
          className={`${animated ? 'progress-fill-animated' : ''} bg-gradient-to-r ${colorClasses[color]}`}
          style={{ width: `${actualPercentage}%` }}
        />
      </div>
    </div>
  );
}

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'lift' | 'glow' | 'bounce' | 'rotate';
}

export function InteractiveCard({ children, className = '', onClick, hoverEffect = 'lift' }: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const hoverEffectClasses = {
    lift: 'hover-lift',
    glow: 'hover-glow',
    bounce: 'hover-bounce',
    rotate: 'hover-rotate'
  };

  return (
    <div 
      className={`
        interactive-card card 
        ${hoverEffectClasses[hoverEffect]} 
        ${isPressed ? 'card-press' : ''} 
        ${className}
      `}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
}

interface FloatingIconProps {
  icon: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingIcon({ icon, delay = 0, duration = 3, className = '' }: FloatingIconProps) {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {icon}
    </div>
  );
}

interface PulsingHeartProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  filled?: boolean;
}

export function PulsingHeart({ size = 'md', className = '', filled = false }: PulsingHeartProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Heart 
      className={`
        ${sizeClasses[size]} 
        ${filled ? 'text-red-500 fill-red-500' : 'text-gray-400'} 
        animate-heartbeat 
        transition-colors duration-200 
        ${className}
      `}
    />
  );
}

interface GlowingElementProps {
  children: React.ReactNode;
  glowColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function GlowingElement({ children, glowColor = 'blue', intensity = 'medium', className = '' }: GlowingElementProps) {
  const glowClasses = {
    blue: intensity === 'high' ? 'shadow-blue-500/50' : intensity === 'medium' ? 'shadow-blue-500/25' : 'shadow-blue-500/10',
    green: intensity === 'high' ? 'shadow-green-500/50' : intensity === 'medium' ? 'shadow-green-500/25' : 'shadow-green-500/10',
    red: intensity === 'high' ? 'shadow-red-500/50' : intensity === 'medium' ? 'shadow-red-500/25' : 'shadow-red-500/10',
    yellow: intensity === 'high' ? 'shadow-yellow-500/50' : intensity === 'medium' ? 'shadow-yellow-500/25' : 'shadow-yellow-500/10',
    purple: intensity === 'high' ? 'shadow-purple-500/50' : intensity === 'medium' ? 'shadow-purple-500/25' : 'shadow-purple-500/10'
  };

  return (
    <div className={`animate-glow ${glowClasses[glowColor]} ${className}`}>
      {children}
    </div>
  );
}

interface StaggeredContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggeredContainer({ children, staggerDelay = 0.1, className = '' }: StaggeredContainerProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className="stagger-item"
          style={{ animationDelay: `${index * staggerDelay}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface SparkleEffectProps {
  trigger: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function SparkleEffect({ trigger, children, className = '' }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50
      }));
      
      setSparkles(newSparkles);
      
      const timer = setTimeout(() => {
        setSparkles([]);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={`relative ${className}`}>
      {children}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute animate-bounce-in pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      ))}
    </div>
  );
}

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked?: boolean;
  progress?: number;
  className?: string;
}

export function AchievementBadge({ 
  icon, 
  title, 
  description, 
  unlocked = false, 
  progress = 0,
  className = ''
}: AchievementBadgeProps) {
  return (
    <InteractiveCard 
      className={`
        relative overflow-hidden
        ${unlocked ? '' : 'opacity-60 grayscale'}
        ${className}
      `}
    >
      {unlocked && (
        <div className="absolute top-2 right-2">
          <SparkleEffect trigger={unlocked}>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </SparkleEffect>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <div className={`
          p-3 rounded-full
          ${unlocked ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}
        `}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          
          {progress > 0 && progress < 100 && (
            <ProgressBar value={progress} max={100} size="sm" color="yellow" />
          )}
        </div>
      </div>
      
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent pointer-events-none" />
      )}
    </InteractiveCard>
  );
}

interface ConfettiTriggerProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export function ConfettiTrigger({ children, trigger, className = '' }: ConfettiTriggerProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; emoji: string; x: number; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈'];
      const newConfetti = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      
      setConfetti(newConfetti);
      
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute animate-bounce-in pointer-events-none text-2xl"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}s`,
            animation: `fall 2s ease-out ${piece.delay}s forwards`
          }}
        >
          {piece.emoji}
        </div>
      ))}
      
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
