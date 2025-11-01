import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'

const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {

  const { chats, setSelectedChat, theme, setTheme, user, navigate } = useAppContext()

  const [search, setSearch] = useState('')


  return (
    <div className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-slate-900/30 to-black/30 border-r border-slate-500/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${!isMenuOpen && `max-md:-translate-x-full`}`}>

      <img src={theme === 'dark' ? assets.chat_sketch_logo : assets.chat_sketch_logo} alt='' className='w-full max-w-48'></img>

      <button className='flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-blue-600 to-blue-800 text-sm rounded-md cursor-pointer'>
        <span className='mr-2 text-xl'>+</span> New Chat
      </button>

      <div className='flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-slate-700 rounded-md'>
        <img src={assets.search_icon} className='w-4 not-dark:invert'></img>
        <input onChange={(e) => setSearch(e.target.value)} value={search} type='text' placeholder='search conversations' className='text-xs placeholder:text-gray-400 outline-none'></input>
      </div>

      {chats.length > 0 && <p className='mt-4 text-sm'>Recent Chats</p>}
      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3 '>
        {
          chats.filter((chat) => chat.messages[0] ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) : chat.name.toLowerCase().includes(search.toLowerCase())).map((chat) => (
            <div onClick={() => {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}} key={chat._id} className='p-2 px-4 dark:bg-slate-800/30 border border-gray-300 dark:border-slate-700/50 rounded-md cursor-pointer flex justify-between group'>
              <div>
                <p className='truncate w-full'>
                  {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-blue-300'>
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img src={assets.bin_icon} className='hidden group-hover:block w-4 cursor-pointer not-dark:invert' alt=''></img>

            </div>
          ))
        }
      </div>

      <div onClick={() => { navigate('/community'); setIsMenuOpen(false) }} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-slate-700 rounded-md cursor-pointer hover:scale-105 transition-all'>
        <img src={assets.gallery_icon} className='w-4.5 not-dark:invert' alt=''></img>
        <div className='flex flex-col text-sm'>
          <p>
            Community images
          </p>
        </div>
      </div>

      <div onClick={() => { navigate('/credits'); setIsMenuOpen(false) }} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-slate-700 rounded-md cursor-pointer hover:scale-105 transition-all'>
        <img src={assets.diamond_icon} className='w-4.5 dark:invert' alt=''></img>
        <div className='flex flex-col text-sm'>
          <p>
            Credits : {user?.credits}
          </p>
          <p className='text-xs text-gray-400'>
            Purchase creadits to use ChatSketch
          </p>
        </div>
      </div>

      <div className='flex items-center  justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-slate-700 rounded-md'>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-4 not-dark:invert'></img>
          <p>
            Dark Mode
          </p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type='checkbox' className='sr-only peer' checked={theme === 'dark'}></input>
          <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-blue-500 transition-all'>

          </div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
      </div>

      <div  className='flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-slate-700 rounded-md cursor-pointer group'>
        <img src={assets.user_icon} className='w-7 rounded-full' alt=''></img>
        <p className=' flex-1 text-sm dark:text-blue-200 truncate'>
          {user? user.name : 'Login to your account'}
        </p>
        {user && <img src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block'/>}
      </div> 

      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert' alt=''></img>

    </div>
  )
}

export default Sidebar