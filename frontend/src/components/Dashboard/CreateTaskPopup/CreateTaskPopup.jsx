import { useState } from 'react';
import './CreateTaskPopup.css';

import Dropdown from '../../Dropdown/Dropdown';
import { useOutletContext } from 'react-router-dom';
import { API } from '../../../Environment';

export const FORM_STATE = {
    CREATE: 0,
    VIEW_OR_EDIT: 1,
    SUBMITTED: 3
}


export default function CreateTaskPopup(props){
    const { userId } = useOutletContext();


    const [taskId, setTaskId] = useState(props.selectedTask.taskId);
    const [name, setName] = useState(props.selectedTask.name);
    const [status, setStatus] = useState(props.selectedTask.status);
    const statusDDL = [{id: 1, label: 'Pending'}, {id: 2, label: 'In Progress'}, {id: 3, label: 'Done'}];

    const [priority, setPriority] = useState(props.selectedTask.priority);
    const priorityDDL = [{id: 1, label: 'Low'}, {id: 2, label: 'Medium'}, {id: 3, label: 'High'}];

    const [deadline, setDeadline] = useState(props.selectedTask.deadline);

    const [description, setDescription] = useState(props.selectedTask.description);
    const dateCreated = props.selectedTask.date;

    const [formState, setFormState] = useState(props.state);
    let formTitle = '';

    function setFormTitleFor(state){
        if(state === FORM_STATE.CREATE){
            formTitle = 'Create New Task';
        }
        else if(state === FORM_STATE.VIEW_OR_EDIT){
            formTitle = 'Task Details';
        }
    }

    setFormTitleFor(props.state);

    

    function taskSaveHandler(event){
        event.preventDefault();
        
        const taskData = {taskId: taskId, name: name, status: status, description: description, priority: priority, deadline: deadline};
        console.log('Saving task :', taskData);

        fetch(API.tasks, {
            method: (formState === FORM_STATE.CREATE) ? 'POST' : 'PUT',
            body: JSON.stringify(taskData),
            headers: {
                "Content-Type": "application/json",
                "Authorization": userId
            }
        })
        .then( (response) => response.json() )
        .then( (response) => {
            // console.log('Create/update task api response :', response);
            if(response.status){
                if(response.status === 'success'){
                    setFormState(FORM_STATE.CREATE);
                    alert('Task saved successfully');
                    props.closeHandler(true);
                }
            }
        })
        .catch( (err) => console.log('Task api error :', err) );

        setFormState(FORM_STATE.SUBMITTED);
    }

    function deleteTask(taskId){
        fetch(API.tasks, {
            method: 'DELETE',
            body: JSON.stringify({taskId: taskId}),
            headers: {
                "Content-Type": "application/json",
                "Authorization": userId
            }
        })
        .then( (response) => response.json() )
        .then( (response) => {
            // console.log('Delete task api response :', response);
            if(response.status){
                if(response.status === 'success'){
                    setFormState(FORM_STATE.CREATE);
                    alert('Task deleted successfully');
                    props.closeHandler(true);
                }
            }
        })
        .catch( (err) => console.log('Create task api error :', err) );

        setFormState(FORM_STATE.SUBMITTED);
    }


    return (
        <div id="CTPRoot">
            <div className="mask"></div>
            <div id="CTPVisibleArea" className='popup'>

                <div className="popup-header flex-h flex-align-center flex-space-bw">
                    <div className="popup-title">{formTitle}</div>
                    <div className="popup-close-ico material-symbols-rounded" onClick={() => props.closeHandler()}>close</div>
                </div>
                <div className="popup-content">
                    <form onSubmit={ (e) => taskSaveHandler(e)} autoComplete="false"
                        className={formState === FORM_STATE.SUBMITTED ? 'form-api-waiting' : undefined}
                    >
                        <div className="form-content">
                            <div className="form-input-root">
                                <div className="form-input-title">Name</div>
                                <input type="text" name="name" id="CTPname" value={name} onChange={(e) => setName(e.target.value)} required/>
                            </div>

                            <div className="form-input-root">
                                <div className="form-input-title">Current Status</div>
                                <Dropdown items={statusDDL} initialVal={status} onValChange={(stat) => setStatus(stat.id)}/>
                            </div>

                            <div className="form-input-root">
                                <div className="form-input-title">Priority</div>
                                <Dropdown items={priorityDDL} initialVal={priority} onValChange={(priority) => setPriority(priority.id)}/>
                            </div>

                            <div className="form-input-root">
                                <div className="form-input-title">Deadline</div>
                                <input type="date" name="deadline" id="CTPDeadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required/>
                            </div>

                            <div className="form-input-root">
                                <div className="form-input-title">Description</div>
                                <textarea name="description" id="CTPDescription" className="gen-input-root" rows="10" value={description} onChange={(e) => setDescription(e.target.value)} required>
                                </textarea>
                            </div>

                            { (props.state === FORM_STATE.VIEW_OR_EDIT) ?
                                <div className="form-input-root flex-h gap-8">
                                    <div className="form-input-title">Created at :</div>
                                    <div>{dateCreated}</div>
                                </div>
                                : null
                            }
                        </div>
                        
                        <div className="form-actions">
                            { (props.state === FORM_STATE.VIEW_OR_EDIT) ?
                                <button type="button" id='TaskDelBtn' className='btn-secondary' onClick={() => deleteTask(taskId)}>Delete task</button>
                                : null
                            }
                            <button type="button" className="btn-txtbtn" onClick={() => props.closeHandler()}>Cancel</button>
                            <button type="submit" className="btn-primary">Save</button>
                        </div>

                        <div className="form-loader"><div className="material-symbols-rounded">progress_activity</div></div>
                    </form>
                </div>

            </div>
        </div>
    );
}