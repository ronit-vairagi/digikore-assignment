import React, { useState } from 'react';

import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard'
import UserSignUpForm from './components/UserSignUpForm/UserSignUpForm';
import UserSignInForm from './components/UserSignInForm/UserSignInForm';

import './App.css';

import linesBg from './assets/lines-bg.svg';

export const USER_STATE = {
  LOGGED_IN: 0,
  LOGGED_OUT: 1
}

let userId = '';

function Layout(){
  const [userState, setUserState] = useState(USER_STATE.LOGGED_OUT);
  const navTo = useNavigate();

  const handleSignIn = (id) => {
    userId = id;
    setUserState(USER_STATE.LOGGED_IN);
    navTo('/dashboard');
  };

  return (
    <div style={{backgroundImage: (userState === USER_STATE.LOGGED_OUT) ? `url(${linesBg})` : undefined}} className='root-bg'>
      <Header userState={userState} onUserStateChange={(state) => {setUserState(state)}}/>
      <Outlet context={{
        onSignIn: (id) => handleSignIn(id),
        userState: userState,
        setUserState: (state) => {setUserState(state)},
        userId: userId
      }} />
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Layout />,
    children: [
      {path: '/', element: <UserSignInForm/>},
      {path: '/sign-in', element: <UserSignInForm/>},
      {path: '/sign-up', element: <UserSignUpForm/>},
      {path: '/dashboard', element: <Dashboard/>},
    ]
  }
]);

function App() {
  return ( <RouterProvider router={router} /> );
}

export default App;
