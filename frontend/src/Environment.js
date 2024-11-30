const backendRoot = 'http://localhost:5000/';

export const API = {
    tasks: backendRoot + 'tasks',
    user: {
        signIn: backendRoot + 'user/sign-in',
        createAccount: backendRoot + 'user/create-account'
    }
};