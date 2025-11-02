import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import Message from './Message';
import toast from 'react-hot-toast';

const ChatBox = () => {

  const containerRef = useRef(null);

  const { selectedChat, theme, user, axios, token } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('text');
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast('Login to send a message');

    const promptCopy = prompt.trim();
    if (!promptCopy) return;

    setLoading(true);
    setPrompt('');
    
    try {
      setMessages(prev => [...prev, { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false }]);

      const { data } = await axios.post(
        `/api/message/${mode}`, 
        { chatId: selectedChat._id, prompt: promptCopy, isPublished }, 
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setMessages(prev => [...prev, data.reply]);
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>

      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.chat_sketch : assets.chat_sketch} className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-700 dark:text-white'> Ask me anything</p>
          </div>
        )}

        {messages.map((message, index) => <Message key={index} message={message} />)}

        {
          loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
          </div>
        }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>
            Publish Generated Image to Community?
          </p>
          <input type='checkbox' className='cursor-pointer' checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}></input>
        </label>
      )}

      <form onSubmit={onSubmit} className='bg-blue-100 dark:bg-blue-900/50 border border-blue-500 dark:border-blue-700 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
          <option className='dark:bg-blue-950' value="text">
            Text
          </option>
          <option className='dark:bg-blue-950' value="image">
            Image
          </option>
        </select>
        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type='text' placeholder='Type your prompt here...' className='flex-1 w-full text-sm outline-none' required></input>
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send} className=' w-8 cursor-pointer'></img>
        </button>
      </form>


    </div>
  )
}

export default ChatBox