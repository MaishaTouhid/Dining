import React from 'react';
/*import SplashScreen from '../screens/SplashScreen';

export default function Index() {
  return <SplashScreen />;
}*/
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/Onboarding');
  }, []);

  return null;
}