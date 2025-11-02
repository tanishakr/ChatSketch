import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;


const Appcontext = createContext()

export const AppcontextProvider = ({ children }) => {

  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loadingUser, setLoadingUser] = useState(true);



  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/data', { headers: { Authorization: token } })
      if (data.success) {
        setUser(data.user)
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }finally{
      setLoadingUser(false);
    }
  }

  const createNewChat = async () => {
    try {
      if (!user) return toast.error('Login to create a new chat')
        navigate('/')
      await axios.get('/api/chat/create', { headers: { Authorization: token } })
      await fetchUserChats()
    } catch (error) {
      toast.error(error.message)
    }
  } 

  const fetchUserChats = async () => {
    try {
      const { data } = await axios.get('/api/chat/get', { headers: { Authorization: token } })
      if (data.success) {
        setChats(data.chats)
        //if user has no chats, create a new chat
        if (data.chats.length === 0) {
          await createNewChat()
          return fetchUserChats()
        }else{
          setSelectedChat(data.chats[0])
        }
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (user) {
      fetchUserChats()
    }
    else {
      setChats([])
      setSelectedChat(null)
    }
  }, [user])

  useEffect(() => {
    if (token) {
      fetchUser()
    }else{
      setUser(null);
      setLoadingUser(false);
    }
  }, [token])

  const value = {
    navigate, user, setUser, fetchUser, chats, setChats, selectedChat, setSelectedChat, theme, setTheme, createNewChat, loadingUser, fetchUserChats, token, setToken, axios
  }

  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  )
}

export const useAppContext = () => useContext(Appcontext)