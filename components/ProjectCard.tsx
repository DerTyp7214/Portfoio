/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Project, Skill } from '../types/types'
import SkillModal from './SkillModal'

type Props = {
  project: Project
  skills: Skill[]
}

export default function ProjectCard({ project, skills }: Props) {
  const [showModal, ShowModal] = useState(false)

  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null)

  const openModal = (skill: Skill) => {
    setCurrentSkill(skill)
    ShowModal(true)
  }

  return (
    <article className='relative flex flex-col rounded-lg items-center space-y-7 flex-shrink-0 snap-center w-[90vw] max-w-[500px] md:w-[600px] md:max-w-none xl:w-[900px] bg-secondaryBackground/70 dark:bg-secondaryBackgroundDark/70 p-10 transition-all duration-200 overflow-hidden backdrop-blur-sm hover:backdrop-blur-md hover:bg-secondaryBackground/90'>
      <SkillModal
        show={showModal}
        skill={currentSkill}
        onClose={() => ShowModal(false)}
      />
      <Link href={`/projects/${project.id}`}>
        <motion.div
          initial={{
            y: -80,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
          }}
          viewport={{ once: true }}
          style={{
            transitionProperty: 'width, height',
          }}
          className='w-32 h-32 rounded-3xl xl:w-[200px] xl:h-[200px] duration-200 overflow-hidden relative cursor-pointer'>
          <img
            src={project.imageUrl}
            alt={project.name}
            className='absolute top-0 left-0 w-full h-full'
          />
        </motion.div>
      </Link>

      <div className='px-0 md:px-10 max-w-full'>
        <h4 className='text-4xl font-light'>{project.name}</h4>
        <p className='text-xl fomt-bold mt-1 space-x-2 flex flex-wrap'>
          {project.authors
            .map((author, index) => (
              <Link
                key={index}
                href={`https://github.com/${author}`}
                target='_blank'>
                {author}
              </Link>
            ))
            .reduce((a, b) => [a, <span key={b.toString()}>&</span>, b] as any)}
        </p>
        {!!project.downloads && (
          <p className='text-md font-light mt-1'>
            <b data-tooltip-content='Not a exact number. Gitlab is not tracked and github can be ~10% more then shown here.'>
              {project.downloads}{' '}
            </b>
            Downloads
          </p>
        )}

        <div className='flex space-x-2 my-2'>
          {project.skills.map((skillName, index) => {
            const skill = skills.find((skill) => skill.name === skillName)
            if (!skill) return null
            return (
              <div
                key={index}
                onClick={() => openModal(skill)}
                className='h-12 w-12 rounded-[5px] bg-background/50 dark:bg-backgroundDark/50 relative flex justify-center items-center cursor-pointer'>
                <img
                  className='p-2 filter z-20 absolute top-0 left-0 w-full h-full'
                  src={skill.imageUrl}
                  alt={skill.name}
                />
                <div className='absolute top-0 left-0 w-full h-full peer z-40' />
                <span className='absolute p-1 top-[-30%] select-none rounded-[5px] opacity-0 peer-hover:opacity-100 transition-all bg-white/50 text-black backdrop-blur-[5px] z-30'>
                  {skill.name}
                </span>
              </div>
            )
          })}
        </div>

        <div className='overflow-y-scroll pr-2 customScroll mb-8 h-[22vh]'>
          <ul className='list-disc sapce-y-4 ml-5 text-lg'>
            {project.keypoints.map((keypoint, index) => (
              <li key={index}>{keypoint}</li>
            ))}
          </ul>
        </div>

        <div className='absolute flex flex-row space-x-2 bottom-4'>
          {project.githubUrl && (
            <Link href={project.githubUrl} target='_blank'>
              <img
                src={
                  project.githubIcon ??
                  'https://github.githubassets.com/favicons/favicon-dark.svg'
                }
                alt='Github'
                className='h-9 w-9 invert dark:invert-0'
                width='9'
                height='9'
              />
            </Link>
          )}
          {project.playStoreUrl && (
            <Link href={project.playStoreUrl} target='_blank'>
              <img
                src={
                  project.playStoreIcon ??
                  'https://www.gstatic.com/android/market_images/web/favicon_v3.ico'
                }
                alt='PlayStore'
                className='h-9 w-9'
                width='9'
                height='9'
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
