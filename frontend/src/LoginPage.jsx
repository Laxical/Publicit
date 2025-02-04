import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const LoginPage = () => {
    const {login} = usePrivy();

    return (
        <div className="login-container">
            <h2>Login Page</h2>
            <button onClick={() => login({loginMethods: ['email', 'sms']})}>
                Login with email and sms only
            </button>
        </div>
    );
};

export default LoginPage;
