import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export  const useAuth=()=>{
    return useContext(AuthContext);
}

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(null);

    useEffect(()=>{
        const checkLoggedIn =async ()=>{
            try{
                const {data}=await axios.get('http://localhost:5001/auth/current_user',{
                    withCredentials:true,
                });

                if (data){
                    setUser(data);
                }
            }catch(err){
                console.error("Not authenticated",err);
                setUser(null);
            }finally{
                setLoading(false)
            }
        }
        checkLoggedIn();
    },[]);

    const value={
        user,
        setUser,
        loading,
    };

    return (
        <AuthProvider value={value}>
            {!loading && children}
        </AuthProvider>
    )




}

