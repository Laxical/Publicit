import { useEffect, useState } from 'react';
import {usePrivy} from '@privy-io/react-auth';
import LoginPage from './LoginPage';
import ActionsPage from './ActionsPage';

const App = () => {
  const { user } = usePrivy();
  const [smartWallet, setSmartWallet] = useState(null);

  useEffect(() => {
    if(user) {
      console.log("Userrrr: ",user);
      setSmartWallet(user.linkedAccounts.find((account) => account.type === 'smart_wallet'));
    }

  },[user]);

  return (
    <div className="app-container">
      {
        user ? <ActionsPage smartWallet={smartWallet} /> : <LoginPage />
      }
    </div>
  );
};

export default App;
