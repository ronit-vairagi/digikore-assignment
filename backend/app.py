from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import json
import os
from dotenv import load_dotenv
from openai import OpenAI


from enum import Enum
import datetime as dt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

load_dotenv()
GPT_KEY = os.getenv('GPT')
client = OpenAI(api_key = GPT_KEY)

# Database configuration
app.config['DB_HOST'] = 'localhost'
app.config['DB_USER'] = 'root'
app.config['DB_PASSWORD'] = 'kajusdb2024'
app.config['DB_NAME'] = 'digikore'

def getDBConnection():
    try:
        return pymysql.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_NAME'],
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception as e:
        print('Error @getDBConnection: ', e)



class PRIORITY(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

class TASK_STATUS(Enum):
    PENDING = 1
    IN_PROGRESS = 2
    DONE = 3

class Task:
    def __init__(self, user, name, description, status, priority, deadline):
        self.dateCreated = dt.datetime.now()
        self.user = user
        self.name = name
        self.description = description
        self.status = status
        self.priority = priority
        self.deadline = dt.datetime.strptime(deadline, '%Y-%m-%d')



@app.route('/user/sign-in', methods=['POST'])
def signin():
    response = { 'status': 'success', 'message': 'Sign-in successful', 'code': 200 }

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if( (not username) or (not password) ) :
        return jsonify({"status": "failed", "message": "Username and password are required"}), 400

    try:
        connection = getDBConnection()
        if(connection):
            try:
                with connection.cursor() as cursor:
                    sql = "SELECT * FROM users WHERE id = %s LIMIT 1"
                    cursor.execute(sql, (username))
                    usersInDB = cursor.fetchall()
                    if(usersInDB) :
                        if(password == usersInDB[0]["password"]):
                            response = { 'status': 'success', 'message': 'Sign-in successful', 'code': 200 }
                        else:
                            response = { 'status': 'failed', 'message': 'Invalid credentials', 'code': 401 }
                    else:
                        response = { 'status': 'failed', 'message': 'Invalid credentials', 'code': 401 }
            except:
                response = { 'status': 'failed', 'message': 'Something went wrong', 'code': 500 }
            finally:
                connection.close()
    except:
        response = { 'status': 'failed', 'message': 'Something went wrong', 'code': 500 }
    
    return jsonify(response), response["code"]
# end of signin()  ----------------------------------------------------------------------------------------------------


@app.route('/user/create-account', methods=['POST'])
def createAccount():
    response = { 'status': 'success', 'message': 'Create account successful', 'code': 200 }

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if( (not username) or (not password) ) :
        return jsonify({"status": "failed", "message": "Username and password are required"}), 400
    
    try:
        connection = getDBConnection()
        if(connection):
            try:
                with connection.cursor() as cursor:
                    sql = "SELECT * FROM users WHERE id = %s LIMIT 1"
                    cursor.execute(sql, (username))
                    usersInDB = cursor.fetchall()
                    if(usersInDB) :
                        response = { 'status': 'failed', 'message': 'User already exists with the id - ' + username, 'code': 401 }
                    else:
                        sqlForAddingNewUser = """
                            INSERT INTO users (id, password)
                            VALUES (%s, %s)
                        """
                        cursor.execute(sqlForAddingNewUser, (username, password))
                        connection.commit()
            except Exception as e:
                print('create account error :', e)
                response = { 'status': 'failed', 'message': 'Something went wrong', 'code': 500 }
            finally:
                connection.close()
    except Exception as e:
        print('create account error :', e)
        response = { 'status': 'failed', 'message': 'Something went wrong', 'code': 500 }
    
    return jsonify(response), response["code"]
# end of createAccount()  ---------------------------------------------------------------------------------------------

def fetchTasksForThisUser(username):
    connection = getDBConnection()
    if(not connection):
        return []
    
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM tasks WHERE user = %s"
            cursor.execute(sql, (username,))
            tasks = cursor.fetchall()
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []
    finally:
        connection.close()

def rankTasksByAI(tasks):
    prompt = "Sort the following tasks in the order of importance, considering deadlines and priority:\n\n"
    for task in tasks:
        deadline = str(task['deadline']).split(' ')[0]
        priority = PRIORITY(task['priority']).name
        taskId = task['id']
        prompt += f"TaskId : {taskId} , Deadline (YYYY-MM-DD) {deadline}, Priority: {priority}\n"
    prompt += "\nProvide the sorted tasks as an array of taskIds (ex: [1, 13, 7]). Do not send anything else in the reponse apart from the array."

    try:
        response = client.chat.completions.create( model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that organizes tasks."},
                {"role": "user", "content": prompt}
            ]
        )

        content = response.choices[0].message.content
        try:
            sortedTasks = json.loads(content)
            return sortedTasks
        except json.JSONDecodeError as e:
            print(f"Failed to parse OpenAI API response: {e}")
            return -1
        
    except Exception as e:
        print('OpenAI API processing error :', e)
        return -1


@app.route('/tasks', methods=['GET'])
def getTaskListAPI():
    username = request.headers.get("Authorization")
    username = str(username)
    if(not username) :
        return jsonify({"status": "failed", "message": "User id is required"}), 400
    
    try:
        tasksInDB = fetchTasksForThisUser(username)
        try:
            doneTasks = list( filter(lambda task: str(task['status']) == '3', tasksInDB) )
            notDoneTasks = list( filter(lambda task: str(task['status']) != '3', tasksInDB) )

            tasksSortedByAI = []
            taskRanks = rankTasksByAI(notDoneTasks)
            if(taskRanks == -1):
                tasksSortedByAI = notDoneTasks + doneTasks
            else:
                prioritisedTasks = []
                taskDict = {task['id']: task for task in notDoneTasks}
                prioritisedTasks = [taskDict[taskID] for taskID in taskRanks]

                tasksSortedByAI = prioritisedTasks + doneTasks

            taskList2 = []
            for task in tasksSortedByAI:
                taskDateSplit = str(task['date_created']).split(':')
                taskDate = taskDateSplit[0] + ':' + taskDateSplit[1]
                deadline = task["deadline"].strftime("%Y-%m-%d")
                taskList2.append({
                    "taskId": task['id'], "name": task['name'], "description": task['description'],
                    "status": task['status'], "date": taskDate, "priority": task["priority"], "deadline": deadline
                })

            return jsonify({"taskList": taskList2}), 200
        except:
            return jsonify({"status": "failed", "message": "Database access failed"}), 500
    except:
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
# end of taskAPI()  ---------------------------------------------------------------------------------------------------

@app.route('/tasks', methods=['POST'])
def addTaskAPI():
    data = request.get_json()
    taskName = data.get("name")
    taskDesc = data.get("description")
    taskStat = data.get("status")
    priority = data.get("priority")
    deadline = data.get("deadline")
    user = request.headers.get('Authorization')


    if((not user) or (not taskName) or (not taskDesc) or (not taskStat) or (not priority) or (not deadline)) :
        return jsonify({"status": "failed", "message": "Incorrect request data"}), 400


    try:
        task = Task(user=user, name=taskName, description=taskDesc, status=taskStat, priority=priority, deadline=deadline)
        connection = getDBConnection()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO tasks (user, name, description, status, date_created, priority, deadline)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (task.user, task.name, task.description, task.status, task.dateCreated, task.priority, task.deadline))
            connection.commit()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    finally:
        connection.close()

    return jsonify({"status": "success", "message": "Task added successfully."}), 200


@app.route('/tasks', methods=['PUT'])
def editTaskAPI():
    data = request.get_json()
    taskId = data.get("taskId")
    taskName = data.get("name")
    taskDesc = data.get("description")
    taskStat = data.get("status")
    priority = data.get("priority")
    deadline = data.get("deadline")
    user = request.headers.get('Authorization')

    if((not user) or (not taskId) or (not taskName) or (not taskDesc) or (not taskStat) or (not priority) or (not deadline)) :
        return jsonify({"status": "failed", "message": "Incorrect request data"}), 400


    try:
        connection = getDBConnection()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    
    try:
        with connection.cursor() as cursor:
            sql = """
                UPDATE tasks
                SET name = %s, description = %s, status = %s, priority = %s, deadline = %s
                WHERE id = %s
            """
            cursor.execute(sql, (taskName, taskDesc, taskStat, priority, deadline, taskId))
            connection.commit()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    finally:
        connection.close()

    return jsonify({"status": "success", "message": "Task updated successfully."}), 200

@app.route('/tasks', methods=['DELETE'])
def deleteTaskAPI():
    data = request.get_json()
    taskId = data.get("taskId")
    user = request.headers.get('Authorization')

    if((not user) or (not taskId)) :
        return jsonify({"status": "failed", "message": "Incorrect request data"}), 400


    try:
        connection = getDBConnection()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM tasks WHERE id = %s"
            cursor.execute(sql, (taskId,))
            connection.commit()
    except:
        connection.close()
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
    finally:
        connection.close()

    return jsonify({"status": "success", "message": "Task updated successfully."}), 200
    


@app.route('/')
def home():
    return jsonify({"message": "Hello from Flask!"})


if __name__ == '__main__':
    app.run(debug=True)