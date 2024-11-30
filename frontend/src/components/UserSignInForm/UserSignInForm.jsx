import './UserSignInForm.css';
import { useState } from "react";
import { useNavigate, useOutletContext } from 'react-router-dom';

import { API } from "../../Environment";


export default function UserSignInForm(props){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onSignIn } = useOutletContext();
    const navTo = useNavigate();

    function formSubmitHandler(event){
        event.preventDefault();
        fetch(API.user.signIn, {
            method: 'POST',
            body: JSON.stringify({username: email, password: password}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then( (response) => {
            console.log('Then block...');
            if(response.status){
                if(response.status === 'success'){
                    onSignIn(email);
                }
                else{
                    alert('Error :', response.message);
                }
            }
            else{
                alert('Error : something is wrong.');
            }
        })
        .catch( (err) => {
            console.log('Catch block... Error:', err);
            alert('Error', err);
        });
    }

    return (
        <div id="SIFRoot">
            <form onSubmit={ (e) => formSubmitHandler(e)} autoComplete="false">
                <div className="form-title">Sign In</div>

                <div className="form-content">
                    <div className="form-input-root">
                        <div className="form-input-title">Email</div>
                        <input type="email" name="email" id="SIFEmail" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    </div>

                    <div className="form-input-root">
                        <div className="form-input-title">Password</div>
                        <input type="password" name="password" id="SIFPassword" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="btn-txtbtn" onClick={() => navTo('/sign-up')}>Create Account</button>
                    <button type="submit" className="btn-primary">Sign In</button>
                </div>
            </form>
        </div>
    );
}