import './TaskTable.css';
import { useState } from 'react';

import Row from './Row/Row'
import CreateTaskPopup, { FORM_STATE } from '../CreateTaskPopup/CreateTaskPopup';

function getDateForHTMLInput(date){
    const DD = date.getDate();
    const MM = date.getMonth() + 1;
    const YY = date.getFullYear();

    return `${YY}-${MM}-${DD}`;
}

const TaskPopupDefaultState = {visible: false, state: FORM_STATE.CREATE};
const EmptyTask = {taskId: -1, name: 'Task Name', status: 1, priority: 1, description: 'Some description here', date: '', deadline: getDateForHTMLInput(new Date)};

export default function TaskTable(props){
    const [taskPopup, setTaskPopup] = useState(TaskPopupDefaultState);
    const [selectedTask, setSelectedTask] = useState(EmptyTask);

    function taskPopupCloseHandler(refresh = false){
        setTaskPopup(TaskPopupDefaultState);

        if(refresh){
            props.onTaskRefresh();
        }
    }

    function rowClickHandler(rowData){
        setSelectedTask(rowData);
        setTaskPopup({visible: true, state: FORM_STATE.VIEW_OR_EDIT});
    }

    function onCreateTaskBtnClick(){
        setSelectedTask(EmptyTask);
        setTaskPopup({visible: true, state: FORM_STATE.CREATE});
    }

    return (
        <div id="TaskTableRoot" className="flex-v">
            <div className="flex-h flex-align-base flex-space-bw">
                <div className="h2">Tasks</div>
                <button type="button" className='btn-secondary' onClick={() => onCreateTaskBtnClick()}>Create Task</button>
            </div>
            <Row isHeader={true} name='Name' description='Description' status='Status' priority='Priority'/>
            {
                props.data.filter( (task) => {
                    let statusMatches = true, priorityMatches = true;
                    if(props.filters.status !== 10){
                        statusMatches = (props.filters.status === task.status) ? true : false;
                    }
                    if(props.filters.priority !== 10){
                        priorityMatches = (props.filters.priority === task.priority) ? true : false;
                    }

                    // console.log('Task ', task.name,
                    //     'SF:', props.filters.status, 'SS:', task.status, 'SM :', statusMatches,
                    //     'PF:', props.filters.priority, 'PP:', task.priority, 'PM :', priorityMatches);

                    return (statusMatches && priorityMatches);
                })
                .map( (rowItem, index) => {
                    const rowData = {...rowItem, taskClickHandler: ()=> rowClickHandler(rowItem)};
                    return <Row key={index} {...rowData} />;
                })
            }
            
            { props.data.length === 0 ? <div id='EmptyTable'>No Data Available</div> : null }

            {
                taskPopup.visible ?
                    < CreateTaskPopup state={taskPopup.state} selectedTask={selectedTask}
                        closeHandler={(refresh) => taskPopupCloseHandler(refresh)} />
                :
                null
            }

        </div>
    );
}
