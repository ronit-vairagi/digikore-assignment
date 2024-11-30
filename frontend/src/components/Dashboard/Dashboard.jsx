import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { API } from '../../Environment';

import StatTile from './StatTile/StatTile';
import TaskTable from './TaskTable/TaskTable';
import TaskDetailPopup from './TaskDetailPopup/TaskDetailPopup';
import { USER_STATE } from '../../App';
import Dropdown from '../Dropdown/Dropdown';

export const TASK_STATUS = {
    PENDING: 1,
    IN_PROGRESS: 2,
    DONE: 3
}

export const PRIORITY = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
}


export default function Dashboard(props){
    const navTo = useNavigate();
    const { userState, userId } = useOutletContext();
    const [ taskList, setTaskList ] = useState([]);
    const [ taskStats, setTaskStats ] = useState({
        pending: {title: 'Pending', ico: 'pending_actions', icoColourClass: 'col-sys-red', count: 0},
        inProgress: {title: 'In-Progress', ico: 'autorenew', icoColourClass: 'col-sys-blue', count: 0},
        done: {title: 'Done', ico: 'check', icoColourClass: 'col-sys-green', count: 0},
        overdue: {title: 'Overdue', ico: 'event_busy', icoColourClass: 'col-sys-red', count: 0}
    });


    function getTaskStats(tasks){
        let stats = {pending: 0, inProgress: 0, done: 0, overdue: 0};
        const currentDate = new Date();

        for(let task of tasks){
            switch (task.status) {
                case TASK_STATUS.PENDING:       stats.pending++;      break;
                case TASK_STATUS.IN_PROGRESS:   stats.inProgress++;   break;
                case TASK_STATUS.DONE:          stats.done++;         break;
                default: break;
            }
            const taskDeadline = new Date(task.deadline);
            if((currentDate > taskDeadline) && (task.status !== TASK_STATUS.DONE)){
                stats.overdue++;
            }
        }
        return stats;
    }

    function fetchTaskList(){
        fetch(API.tasks, {
            method: 'GET',
            headers: {
                "Authorization": userId
            }
        })
        .then( (response) => response.json() )
        .then( (response) => {
            console.log('Tasks API response :', response);
            setTaskList(response.taskList);
            let stats = getTaskStats(response.taskList);
            const newTaskStats = {...taskStats};
            newTaskStats.pending.count = stats.pending;
            newTaskStats.inProgress.count = stats.inProgress;
            newTaskStats.done.count = stats.done;
            newTaskStats.overdue.count = stats.overdue;
            setTaskStats(newTaskStats);
        })
        .catch( (err) => {console.log('Tasks api error :', err)});
    }

    useEffect( () => {
        (userState !== USER_STATE.LOGGED_IN) ? navTo('/sign-in') : fetchTaskList()
    }, []);

    const [openTask, setOpenTask] = useState();

    const [activeStatusFilter, setActiveStatusFilter] = useState(10);
    const [activePriorityFilter, setActivePriorityFilter] = useState(10);
    const statusFilter = [{id: 10, label: 'All'}, {id: 1, label: 'Pending'}, {id: 2, label: 'In Progress'}, {id: 3, label: 'Done'}];
    const priorityFilter = [{id: 10, label: 'All'}, {id: 1, label: 'Low'}, {id: 2, label: 'Medium'}, {id: 3, label: 'High'}];

    return (
        <div id="DashboardRoot" className="">
            <div className="h2">Tasks Overview</div>
            <div id="DashStatsRoot" className="flex-h flex-align-center flex-wrap">
                <StatTile {...taskStats.pending}/>
                <StatTile {...taskStats.inProgress}/>
                <StatTile {...taskStats.done}/>
                <StatTile {...taskStats.overdue}/>
            </div>

            <div id="FiltersRoot" className='flex-h flex-align-center flex-wrap gap-24'>
                <div id="FiltersHeading">Filters :</div>
                <div className="filter-root flex-h flex-align-center gap-8">
                    <div className="filter-title">Status</div>
                    <div className="filter-dd-root">
                        <Dropdown items={statusFilter} initialVal={10} onValChange={(filt) => setActiveStatusFilter(filt.id)}/>
                    </div>
                </div>

                <div className="filter-root flex-h flex-align-center gap-8">
                    <div className="filter-title">Priority</div>
                    <div className="filter-dd-root">
                        <Dropdown items={priorityFilter} initialVal={10} onValChange={(filt) => setActivePriorityFilter(filt.id)}/>
                    </div>
                </div>
            </div>

            <   TaskTable data={taskList || []} filters={{status: activeStatusFilter, priority: activePriorityFilter}}
                taskClickHandler={(task) => setOpenTask(task)} onTaskRefresh={() => fetchTaskList()}
            />

            {openTask ? <TaskDetailPopup {...openTask} closeHandler={() => setOpenTask(undefined)} /> : null}
        </div>
    );
}