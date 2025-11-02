import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({message}) => {

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content])


  return (
    <div>
      {message.role === 'user' ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-md max-w-2xl'>
          <p className='text-sm dark:text-blue-200'>
            {message.content}
          </p>
          <span className='text-xs text-gray-400 dark:text-blue-400'>
            {moment(message.timestamp).fromNow()}
          </span>
          </div>
          <img src={assets.account} alt='' className='w-8 rounded-full'></img>
        </div>
      )
    : 
    (
      <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-blue-100/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-md my-4'>
        {message.isImage ? (
          <img src={message.content} className='w-full max-w-md mt-2 rounded-md'></img>
        ) : 
        (
          <div className='text-sm dark:text-blue-200 reset-tw'>
            <Markdown>
              {message.content}
            </Markdown>
          </div>
        )}
        <span className='text-xs text-gray-400 dark:text-blue-300'>
          {moment(message.timestamp).fromNow()}
        </span>

      </div>
    )}
    </div>
  )
}

export default Message