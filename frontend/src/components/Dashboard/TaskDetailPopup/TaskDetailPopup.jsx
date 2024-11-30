import './TaskDetailPopup.css';
export default function TaskDetailPopup(props){
    return (
        <div id="TaskDetilPopupRoot">
            <div className="mask"></div>
            <div id="TDPVisibleArea" className='popup'>
                <div className="popup-header flex-h flex-align-center flex-space-bw">
                    <div className="popup-title">{props.name}</div>
                    <div className="popup-close-ico material-symbols-rounded" onClick={() => props.closeHandler()}>close</div>
                </div>
                <div className="popup-content">
                    <div id="TDPStatus">{props.status}</div>
                    <div id="TDPDescription">{props.description}</div>
                </div>
            </div>
        </div>
    );
}