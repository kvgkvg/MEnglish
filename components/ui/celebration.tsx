"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Star, Zap } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  type: "trophy" | "streak" | "star" | "levelup";
  message?: string;
  onComplete?: () => void;
}

export function Celebration({ show, type, message, onComplete }: CelebrationProps) {
  const icons = {
    trophy: Trophy,
    streak: Flame,
    star: Star,
    levelup: Zap,
  };

  const colors = {
    trophy: "text-yellow-500",
    streak: "text-orange-500",
    star: "text-purple-500",
    levelup: "text-blue-500",
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-radial from-yellow-200 to-transparent"
          />

          {/* Main celebration content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            onAnimationComplete={() => {
              if (onComplete) {
                setTimeout(onComplete, 2000);
              }
            }}
            className="relative pointer-events-auto"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 blur-xl ${
                type === "trophy"
                  ? "bg-yellow-400"
                  : type === "streak"
                  ? "bg-orange-400"
                  : type === "star"
                  ? "bg-purple-400"
                  : "bg-blue-400"
              } rounded-full`}
            />

            {/* Icon */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative bg-white rounded-full p-8 shadow-2xl"
            >
              <Icon className={`w-24 h-24 ${colors[type]}`} />
            </motion.div>

            {/* Sparkles around icon */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 100,
                  y: Math.sin((i / 8) * Math.PI * 2) * 100,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">{message}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress milestone celebration
interface MilestoneProps {
  show: boolean;
  milestone: number;
  message: string;
}

export function MilestoneCelebration({ show, milestone, message }: MilestoneProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="bg-gradient-to-br from-purple-500 to-blue-600 text-white px-12 py-8 rounded-2xl shadow-2xl pointer-events-auto"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  delay: 0.2,
                }}
                className="text-8xl font-black mb-4"
              >
                {milestone}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold"
              >
                {message}
              </motion.p>
            </motion.div>

            {/* Particle burst */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Streak counter with flame animation
interface StreakCounterProps {
  streak: number;
  animate?: boolean;
}

export function StreakCounter({ streak, animate = false }: StreakCounterProps) {
  return (
    <motion.div
      animate={
        animate
          ? {
              scale: [1, 1.2, 1],
            }
          : {}
      }
      transition={{
        duration: 0.3,
      }}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg"
    >
      <motion.div
        animate={
          animate
            ? {
                rotate: [0, -10, 10, -10, 10, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
        }}
      >
        <Flame className="w-5 h-5" />
      </motion.div>
      <span className="font-bold text-lg">{streak} Day Streak!</span>
    </motion.div>
  );
}
