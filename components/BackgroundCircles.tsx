import { motion } from 'framer-motion'

type Props = {}

export default function BackgroundCircles({}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        scale: [1, 2, 2, 3, 1],
        opacity: [0.1, 0.2, 0.4, 0.8, 0.1, 1],
        borderRadius: ['20%', '20%', '50%', '80%', '20%'],
      }}
      transition={{
        duration: 2.5,
      }}
      className='relative flex justify-center items-center'>
      <motion.div className='absolute border border-tertiary/30 dark:border-tertiaryDark/30 rounded-full h-[45vh] w-[45vh] mt-52 animate-ping' />
      <motion.div className='absolute border border-secondaryBackgroundDark/5 dark:border-secondaryBackgroundDark/10 rounded-full h-[55vh w-55vh] mt-52' />
      <motion.div className='absolute border border-secondaryBackgroundDark/10 dark:border-secondaryBackgroundDark/20 rounded-full h-[65vh] w-[65vh] mt-52' />
      <motion.div className='absolute border border-accent dark:border-accentDark rounded-full opacity-20 h-[80vh] w-[80vh] mt-52 animate-pulse ' />
      <motion.div className='absolute border border-secondaryBackgroundDark/10 dark:border-secondaryBackgroundDark/25 rounded-full h-[110vh] w-[110vh] mt-52' />
    </motion.div>
  )
}
