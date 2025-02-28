import { motion } from 'framer-motion';

/**
 * Loader component that displays an animated loading indicator
 * @param {Object} props
 * @param {string} [props.size='medium'] - Size of the loader ('small', 'medium', 'large')
 * @param {string} [props.color='blue'] - Color theme of the loader
 * @returns {React.ReactNode}
 */
const Loader = ({ size = 'medium', color = 'blue' }) => {
  // Define sizes
  const sizes = {
    small: {
      container: 'w-16 h-16',
      circle: 'w-2 h-2',
    },
    medium: {
      container: 'w-24 h-24',
      circle: 'w-3 h-3',
    },
    large: {
      container: 'w-32 h-32',
      circle: 'w-4 h-4',
    },
  };

  // Define colors
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      }
    }
  };

  const circleVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }
    }
  };

  // Positions for the dots
  const positions = [
    { top: '0%', left: '50%' },
    { top: '14%', right: '14%' },
    { top: '50%', right: '0%' },
    { bottom: '14%', right: '14%' },
    { bottom: '0%', left: '50%' },
    { bottom: '14%', left: '14%' },
    { top: '50%', left: '0%' },
    { top: '14%', left: '14%' },
  ];

  return (
    <motion.div
      className={`relative ${sizes[size].container}`}
      variants={containerVariants}
      animate="animate"
    >
      {positions.map((position, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${sizes[size].circle} ${colors[color]}`}
          style={position}
          variants={circleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </motion.div>
  );
};

export default Loader; 