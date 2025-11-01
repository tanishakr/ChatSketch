import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";


const Appcontext = createContext()

export const AppcontextProvider = ({children}) => {

  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const fetchUser = async () => {
    setUser(dummyUserData)
  }

  const fetchUserChats = async () => {
    setChats(dummyChats)
    setSelectedChat(dummyChats[0])
  }

  useEffect(() => {
    if(theme === 'dark'){
      document.documentElement.classList.add('dark');
    }
    else{
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (user){
      fetchUserChats()
    }
    else{
      setChats([])
      setSelectedChat(null)
    }
  }, [user])

  useEffect(() => {
    fetchUser()
  },[])

  const value = {
    navigate, user, setUser, fetchUser, chats, setChats, selectedChat, setSelectedChat, theme, setTheme
  }

  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  )
}

export const useAppContext = () => useContext(Appcontext)