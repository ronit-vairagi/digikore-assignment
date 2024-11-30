from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

from enum import Enum
import datetime as dt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Database configuration
app.config['DB_HOST'] = 'localhost'
app.config['DB_USER'] = 'root'
app.config['DB_PASSWORD'] = 'kajusdb2024'
app.config['DB_NAME'] = 'digikore'

def get_db_connection():
    try:
        return pymysql.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_NAME'],
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception as e:
        print('Error @get_db_connection: ', e)



# UsersDB = [
#     {"id": "ronit@ronit.com", "password": "bietheboss"},
#     {"id": "ronit2@ronit.com", "password": "bietheboss"},
# ]


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

    # def to_dict(self):
    #     return {
    #         "name": self.name,
    #         "description": self.description,
    #         "status": self.status.value
    #     }


@app.route('/user/sign-in', methods=['POST'])
def signin():
    response = { 'status': 'success', 'message': 'Sign-in successful', 'code': 200 }

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if( (not username) or (not password) ) :
        return jsonify({"status": "failed", "message": "Username and password are required"}), 400

    try:
        connection = get_db_connection()
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
        connection = get_db_connection()
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
    print('@fetchTasksForThisUser')
    connection = get_db_connection()
    if(not connection):
        return []
    
    try:
        # print('@fetchTasksForThisUser try block')
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

@app.route('/tasks', methods=['GET'])
def getTaskListAPI():
    print('@getTaskListAPI')
    username = request.headers.get("Authorization")
    username = str(username)
    if(not username) :
        return jsonify({"status": "failed", "message": "User id is required"}), 400
    
    try:
        tasksInDB = fetchTasksForThisUser(username)
        taskList2 = []
        for task in tasksInDB:
            taskDateSplit = str(task['date_created']).split(':')
            taskDate = taskDateSplit[0] + ':' + taskDateSplit[1]
            deadline = task["deadline"].strftime("%Y-%m-%d")
            taskList2.append({
                "taskId": task['id'], "name": task['name'], "description": task['description'],
                "status": task['status'], "date": taskDate, "priority": task["priority"], "deadline": deadline
            })

        return jsonify({"taskList": taskList2}), 200
    except:
        return jsonify({"status": "failed", "message": "Something went wrong. Please try again later."}), 500
# end of taskAPI()  ---------------------------------------------------------------------------------------------------

@app.route('/tasks', methods=['POST'])
def addTaskAPI():
    print('@addTaskAPI---------------------')
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
        connection = get_db_connection()
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
    print('@editTaskAPI---------------------')
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
        connection = get_db_connection()
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
    print('@deleteTaskAPI---------------------')
    data = request.get_json()
    taskId = data.get("taskId")
    user = request.headers.get('Authorization')

    if((not user) or (not taskId)) :
        return jsonify({"status": "failed", "message": "Incorrect request data"}), 400


    try:
        connection = get_db_connection()
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