import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUserChats, setToken, token } = useAppContext()

  const [search, setSearch] = useState('')

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged out successfully');
  }

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm('Are you sure you want to delete this chat?');
      if (!confirm) return;
      const { data } = await axios.post('/api/chat/delete', { chatId }, { headers: { Authorization: token } });
      if (data.success) {
        setChats(chats.filter((chat) => chat._id !== chatId));
        await fetchUserChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }


  return (
    <div className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-slate-900/30 to-black/30 border-r border-slate-500/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${!isMenuOpen && `max-md:-translate-x-full`}`}>


      {/*new chat button*/}
      <button onClick={createNewChat} className='flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-blue-500 to-blue-800 text-sm rounded-md cursor-pointer'>
        <span className='mr-2 text-xl'>+</span> New Chat
      </button>

      <div className='flex items-center gap-2 p-3 mt-4 border border-blue-500 dark:border-blue-700 rounded-md'>
        <img src={assets.magnifying_glass} className='w-4 dark:invert'></img>
        <input onChange={(e) => setSearch(e.target.value)} value={search} type='text' placeholder='search conversations' className='text-xs placeholder:text-gray-400 outline-none'></input>
      </div>

      {chats.length > 0 && <p className='mt-4 text-sm'>Recent Chats</p>}
      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3 '>
        {
          chats.filter((chat) => chat.messages[0] ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) : chat.name.toLowerCase().includes(search.toLowerCase())).map((chat) => (
            <div onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }} key={chat._id} className='p-2 px-4 dark:bg-slate-800/30 border border-blue-300 dark:border-blue-700/50 rounded-md cursor-pointer flex justify-between group'>
              <div>
                <p className='truncate w-full'>
                  {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-blue-300'>
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                onClick={e => deleteChat(e, chat._id)}
                src={assets.bin_icon}
                className='hidden group-hover:block w-4 cursor-pointer not-dark:invert'
                alt=''
              ></img>

            </div>
          ))
        }
      </div>

      <div onClick={() => { navigate('/community'); setIsMenuOpen(false) }} className='flex items-center gap-2 p-3 mt-4 border border-blue-300 dark:border-blue-600/70 rounded-md cursor-pointer hover:scale-105 transition-all'>
        <img src={assets.communications} className='w-4.5 dark:invert' alt=''></img>
        <div className='flex flex-col text-sm'>
          <p>
            Community images
          </p>
        </div>
      </div>

      <div className='flex items-center  justify-between gap-2 p-3 mt-4 border border-blue-300 dark:border-blue-600/70 rounded-md'>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.dark_mode} className='w-5 dark:invert'></img>
          <p>
            Dark Mode
          </p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type='checkbox' className='sr-only peer' checked={theme === 'dark'}></input>
          <div className='w-9 h-5 bg-blue-400 rounded-full peer-checked:bg-blue-500 transition-all'>

          </div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
      </div>

      <div className='flex items-center gap-3 p-3 mt-4 border border-blue-500 dark:border-blue-700 rounded-md cursor-pointer group'>
        <img src={assets.account} className='w-7 rounded-full' alt=''></img>
        <p className=' flex-1 text-lg dark:text-blue-200 truncate'>
          {user ? user.name : 'Login to your account'}
        </p>
        {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block' />}
      </div>

      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert' alt=''></img>

    </div>
  )
}

export default Sidebar