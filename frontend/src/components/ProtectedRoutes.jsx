import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const [user,loading]=useAuth();

    if (loading){
        return null;
    }
    if(user){
        return children;
    }
    return <Navigate to="/"></Navigate>
}

export default ProtectedRoutes