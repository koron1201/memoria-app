export const transitions = {
  default: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  gentle: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  bouncy: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const },
  slow: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
} as const;

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: transitions.gentle,
};

export const cardStagger = {
  container: { transition: { staggerChildren: 0.08 } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: transitions.default },
  },
};
