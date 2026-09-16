import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

// Screens
import LoginScreen from './screens/LoginScreen';
import PolicyScreen from './screens/PolicyScreen';
import ProfileCreationScreen from './screens/ProfileCreationScreen';
import ProfileScreen from './screens/ProfileScreen';
import BullyingScreen from './screens/BullyingScreen';
import FightScreen from './screens/FightScreen';
import SOSScreen from './screens/SOSScreen';
import GroupsScreen from './screens/GroupsScreen';
import MessagesScreen from './screens/MessagesScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Bullying') iconName = focused ? 'warning' : 'warning-outline';
          else if (route.name === 'Fight') iconName = focused ? 'shield' : 'shield-outline';
          else if (route.name === 'SOS') iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          else if (route.name === 'Groups') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Messages') iconName = focused ? 'mail' : 'mail-outline';
          else if (route.name === 'Admin') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#95a5a6',
        headerShown: true
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 Profil' }} />
      <Tab.Screen name="Bullying" component={BullyingScreen} options={{ title: '🚨 Zorbalığa Uğradım' }} />
      <Tab.Screen name="Fight" component={FightScreen} options={{ title: '⚔️ Kavgaya Adam Çağır' }} />
      <Tab.Screen name="SOS" component={SOSScreen} options={{ title: '🆘 Yardım' }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: '👫 Gruplar' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: '💬 Mesajlar' }} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const profileCompleted = await AsyncStorage.getItem('profileCompleted');
      const policyAccepted = await AsyncStorage.getItem('policyAccepted');
      const adminStatus = await AsyncStorage.getItem('isAdmin');

      if (token) {
        setIsLoggedIn(true);
        setHasCompletedProfile(profileCompleted === 'true');
        setAcceptedPolicy(policyAccepted === 'true');
        setIsAdmin(adminStatus === 'true');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Replace with splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : !acceptedPolicy ? (
          <Stack.Screen name="Policy" component={PolicyScreen} />
        ) : !hasCompletedProfile ? (
          <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            {isAdmin && <Stack.Screen name="Admin" component={AdminPanelScreen} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;