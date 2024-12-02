# Digikore Fullstack-Developer Assignment
#### Ronit Vairagi | ronit.vairagi@outlook.com

## Stack
React (frontend), Flask-Python (backend), MySQL (database)

## Development Environment
- OS : Windows
- Python : v3.8.8 | PIP : v20.2.3 | Flask : 3.0.3
- MySQL Server : v8.0.40
- Node.js : 20.17.0
- React : 18.3.1


### Database : Setup instructions
- Download & install MySQL server from https://dev.mysql.com/downloads/installer/
- Open a terminal and start sql cli using the command : `mysql -u root -p`
    - Enter the root password (set during MySQL server installation)
- Run the below commands to setup the database
```sh
// Create database
CREATE DATABASE digikore;
use digikore;

// Create table for storing users
CREATE TABLE users (
    id VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL
);

// Create table for storing tasks
CREATE TABLE tasks (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    status INT DEFAULT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(255) DEFAULT NULL,
    priority INT DEFAULT NULL,
    deadline TIMESTAMP DEFAULT NULL
);

// Verify tables by running the below command
SHOW TABLES;
```

### Local server : Setup instructions
- Download & install Python from `https://www.python.org/`
- Download & install Node.js from `https://www.nodejs.org/`
- Navigate to project folder
- Create a virtual environment using the command : `python -m venv venv`
- Run `.\venv\Scripts\activate`
- Navigate to `backend` folder & install backend packages using : `pip install -r requirements.txt`
- Download the .env file from `https://drive.google.com/file/d/1Z0eG2fGDcEGFmkCDzO16xUDjiaGK1WIx/view?usp=drive_link` and copy it to the backend folder.
    - This file contains the access-key for Open-AI's APIs and is required to run the app.
- Run `python .\app.py`
- Verify backend status by opening `http://localhost:5000` in the browser.
- Navigate to `frontend` folder
- Install frontend packages using the command : `npm install`
- Run : `npm start`


Open `http://localhost:3000` in the browser. This should open a sign-in page as shown below :
![Sign In Page](./sign-in.png)


### Note to the Reviewer
Considering the short deadline for submission, few implementations are not done:
- Authentication via a secure token isn't implemented. Neither any session management for the user is in place.
    - All APIs are currently using user-id for authentication.
- Form Validations : Validations are not implemented for create/edit task form
- Delete confirmation dialog is not implemented.
- UI for showing error messages to the user is not implemented.

#### Overall status
| Task | Status |
|------|:--------:|
| UI for Sign In Page | Done |
| UI for Sign Up Page | Done |
| UI for Dashboard with widgets and table | Done |
| UI for creating/editing/deleting a task | Done |
| UI for filtering tasks based on status/priority | Done  |
| API for creating user-account | Done |
| API for sign-in | Done |
| API for fetching tasks of the user | Done |
| API for creating a task | Done |
| API for updating a task | Done |
| API for deleting a task | Done |
| Backend function for sorting the list on AI based priority ranking | ~~Pending~~ Done |

