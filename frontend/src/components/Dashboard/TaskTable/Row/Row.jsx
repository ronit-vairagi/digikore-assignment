import './Row.css';

import { TASK_STATUS, PRIORITY } from '../../Dashboard';

export default function Row(props){
    let icon = '', iconClass = '', rowClass='tt-row flex-h flex-align-center flex-space-bw gap-24';

    let prIcon = '', prIconClass = '';

    if(props.isHeader){
        icon = props.status;
        iconClass = 'tt-status';
        prIcon = props.priority;
        prIconClass = 'tt-priority';
        rowClass = rowClass + ' tt-row-head';
    }
    else{
        switch(props.status){
            case TASK_STATUS.PENDING:{
                icon = 'pending_actions';
                iconClass = 'tt-status tt-stat-pending material-symbols-rounded';
                break;
            }
    
            case TASK_STATUS.IN_PROGRESS: {
                icon = 'autorenew';
                iconClass = 'tt-status tt-stat-in-progress material-symbols-rounded';
                break;
            }
    
            case TASK_STATUS.DONE:{
                icon = 'check';
                iconClass = 'tt-status tt-stat-done material-symbols-rounded';
                break;
            }
    
            default: break;
        }

        switch(props.priority){
            case PRIORITY.LOW:{
                prIcon = 'kid_star';
                prIconClass = 'tt-priority tt-pri-low material-symbols-rounded';
                break;
            }
    
            case PRIORITY.MEDIUM: {
                prIcon = 'kid_starkid_star';
                prIconClass = 'tt-priority tt-pri-med material-symbols-rounded';
                break;
            }
    
            case PRIORITY.HIGH:{
                prIcon = 'kid_starkid_starkid_star';
                prIconClass = 'tt-priority tt-pri-high material-symbols-rounded';
                break;
            }
    
            default: break;
        }
    }

    return (
        <div className={rowClass} title={props.isHeader ? undefined : 'Click to view details'} onClick={ () => ( (!props.isHeader) && props.taskClickHandler() )}>
            <div className="tt-name txt-ellipsis">{props.name}</div>
            <div className="tt-description txt-ellipsis">{props.description}</div>
            <div className={prIconClass}>{prIcon}</div>
            <div className={iconClass}>{icon}</div>
        </div>
    );
}