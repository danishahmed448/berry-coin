import React from 'react';
import { motion } from 'framer-motion';

export const GoldDust: React.FC = () => {
    // Generate 25 random particles
    const particles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // Random start position %
        y: Math.random() * 100,
        size: Math.random() * 4 + 1, // Random size 1-5px
        duration: Math.random() * 10 + 10, // Random duration 10-20s
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700]"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        opacity: 0.6,
                    }}
                    animate={{
                        y: [0, -100, -200], // Float up
                        x: [0, Math.random() * 50 - 25, 0], // Drift sideways
                        opacity: [0, 0.8, 0], // Fade in/out
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
};
