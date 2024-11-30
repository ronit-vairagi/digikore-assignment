import { useState } from "react";
import { useNavigate, useOutletContext } from 'react-router-dom';

import './UserSignUpForm.css';
import { API } from "../../Environment";

export default function UserSignUpForm(props){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navTo = useNavigate();

    function formSubmitHandler(event){
        event.preventDefault();
        fetch(API.user.createAccount, {
            method: 'POST',
            body: JSON.stringify({username: email, password: password}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then( (response) => {
            if(response.status === 'success'){
                alert('Account created successfully !');
                navTo('/sign-in');
            }
        })
        .catch( (err) => {
            console.log('Sign up api error :', err);
            try{
                const errJson = err.json();
                if(errJson.message){
                    alert('Error : ' + errJson.message);
                    return;
                }
            }
            catch{}
            alert('Error : Something went wrong !');
        })

        console.log('form submitted');
    }

    return (
        <div id="SUFRoot">
            <form onSubmit={ (e) => formSubmitHandler(e)} autoComplete="false">
                <div className="form-title">Create Account</div>

                <div className="form-content">
                    <div className="form-input-root">
                        <div className="form-input-title">Email</div>
                        <input type="email" name="email" id="SUFEmail" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    </div>

                    <div className="form-input-root">
                        <div className="form-input-title">Password</div>
                        <input type="password" name="password" id="SUFPassword" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="btn-txtbtn" onClick={() => navTo('/sign-in')}>Sign In</button>
                    <button type="submit" className="btn-primary">Create Account</button>
                </div>
            </form>
        </div>
    );
}