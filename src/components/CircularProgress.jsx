import { motion, AnimatePresence } from 'framer-motion'

export default function CircularProgress({
  value = 0,
  size = 64,
  strokeWidth = 5,
  color = '#6366f1',
  label = true,
  done = false,
}) {
  const radius       = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (value / 100) * circumference
  const fontSize     = size < 48 ? 9 : size < 64 ? 11 : 13
  const checkSize    = Math.round(size * 0.38)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={value === 0 ? 'rgba(255,255,255,0.08)' : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>

      {/* Center content */}
      <AnimatePresence mode="wait">
        {done ? (
          /* ✓ Done checkmark */
          <motion.svg
            key="check"
            width={checkSize}
            height={checkSize}
            viewBox="0 0 24 24"
            fill="none"
            className="z-10"
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
            />
          </motion.svg>
        ) : label ? (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-white z-10"
            style={{ fontSize }}
          >
            {value}%
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
