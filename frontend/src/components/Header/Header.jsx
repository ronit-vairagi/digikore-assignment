import { NavLink, useNavigate } from 'react-router-dom';

import './Header.css';
import { USER_STATE } from '../../App';

export default function Header(props){
    const navTo = useNavigate();

    function signOut(){
        props.onUserStateChange(USER_STATE.LOGGED_OUT);
        navTo('/sign-in');
    }

    return (
        <div id="HeaderRoot" className="flex-h flex-nowrap flex-space-bw flex-align-center">
            <div id="HRLeftSection" className="flex-h flex-nowrap flex-align-center">
                <span id='HeaderLogo2'>DIGIKORE</span>
                {/* <NavLink to='/dashboard' id='Title'>Dashboard</NavLink> */}
                { (props.userState === USER_STATE.LOGGED_IN) ?
                    <NavLink to='/dashboard' id='Title'>Dashboard</NavLink> : null
                }
            </div>
            <div id="HRRightSection" className="flex-h flex-nowrap flex-align-center">
                { (props.userState === USER_STATE.LOGGED_IN) ?
                    <button type="button" className='btn-txtbtn' onClick={signOut}>Sign Out</button> : null
                }
            </div>
        </div>
    );
}