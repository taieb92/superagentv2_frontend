export const motionTokens = {
  ease: [0.4, 0, 0.2, 1] as const,
  dur: {
    fast: 0.12,
    normal: 0.2,
    slow: 0.32,
  },
  y: {
    enter: 8,
    micro: 4,
  },
  stagger: 0.04,
};
export const fadeUp = {
  hidden: {
    opacity: 0,
    y: motionTokens.y.enter,
  },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.dur.normal,
      ease: motionTokens.ease,
      delay,
    },
  }),
};
export const listContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: motionTokens.stagger,
    },
  },
};
export const listItem = {
  hidden: {
    opacity: 0,
    y: motionTokens.y.enter,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.dur.normal,
      ease: motionTokens.ease,
    },
  },
};
export const subtleHover = {
  whileHover: {
    y: -2,
    transition: {
      duration: motionTokens.dur.fast,
      ease: motionTokens.ease,
    },
  },
};
