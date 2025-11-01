import React, { use, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Loading = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/');
    }, 8000);

    return () => clearTimeout(timeout);
  }, [])

  return (
    <div className='bg-gradient-to-b from-slate-900 to-black backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-2xl text-white'>
      <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin'>

      </div>
    </div>
  )
}

export default Loading