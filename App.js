import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications';
import Task from './components/Task';

const STORAGE_KEY = 'muistilistaStorageKey';

export default function App() {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);

  const saveData = async () => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(taskList));
    } catch (e) {
      console.log('Error saving data', e);
    }
  };

  const loadData = async () => {
    try {
      const value = await SecureStore.getItemAsync(STORAGE_KEY);
      if (value !== null) {
        setTaskList(JSON.parse(value));
      }
    } catch (e) {
      console.log('Error loading data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [taskList]);

  const getNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    return status === 'granted';
  };

  const handleDeadlineSet = async (index, newDeadline) => {
    const newList = [...taskList];
    const task = newList[index];
  
    if (task.notificationId30min) {
      await Notifications.cancelScheduledNotificationAsync(task.notificationId30min);
    }
    if (task.notificationId24hr) {
      await Notifications.cancelScheduledNotificationAsync(task.notificationId24hr);
    }
  
    newList[index] = { ...task, deadline: newDeadline };
  
    setTaskList(newList);
    saveData();
  
    const permissionGranted = await getNotificationPermission();
    if (permissionGranted) {
      const ids = await scheduleNotification(task.description, newDeadline);
      newList[index].notificationId30min = ids.id30min;
      newList[index].notificationId24hr = ids.id24hr;
  
      setTaskList(newList);
      saveData();
    }
  };
  
  const scheduleNotification = async (taskDescription, date) => {
    const currentTime = new Date().getTime();
    const taskTime = new Date(date).getTime();
  
    let id30min, id24hr;
  
    // 30 minuuttia ennen deadlinea
    const timeBefore30Min = taskTime - currentTime - 30 * 60 * 1000;
    if (timeBefore30Min > 0) {
      id30min = (await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Muistutus!',
          body: `30 minuutin kuluttua: ${taskDescription}`,
        },
        trigger: { seconds: timeBefore30Min / 1000 },
      })).identifier;
    }
  
    // 24 tuntia ennen deadlinea
    const timeBefore24Hours = taskTime - currentTime - 24 * 60 * 60 * 1000;
    if (timeBefore24Hours > 0) {
      id24hr = (await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Muistutus!',
          body: `24 tunnin kuluttua: ${taskDescription}`,
        },
        trigger: { seconds: timeBefore24Hours / 1000 },
      })).identifier;
    }
  
    return { id30min, id24hr };
  };

  const handleAddTask = async () => {
    if (task !== '') {
      const newTask = {
        description: task, 
        deadline: new Date()
      };
      setTaskList([...taskList, newTask]);
      setTask('');
      const permissionGranted = await getNotificationPermission();
      if (permissionGranted) {
        await scheduleNotification(newTask.description, newTask.deadline);
      }
    }
  };

  const handleDeleteTask = (index, task) => {
    Alert.alert(
      "Varmistus",
      `Haluatko varmasti poistaa muistutuksen?`,
      [
        {
          text: "Peruuta",
          style: "cancel"
        },
        { text: "OK", onPress: () => {
          const newList = [...taskList];
          newList.splice(index, 1);
          setTaskList(newList);
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muistilista</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Lisää tehtävä listaan..."
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <Button title="Lisää" onPress={handleAddTask} color="#7a7068" />
      </View>
      <ScrollView style={styles.taskContainer}>
      {taskList.map((item, index) => (
        <Task
          key={index}
          task={item.description}
          onDeadlineSet={(newDeadline) => handleDeadlineSet(index, newDeadline)}
          onDelete={() => handleDeleteTask(index)}
        />
      ))}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edd5c2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'black',
    padding: 10,
    width: '70%',
  },
  taskContainer: {
    width: '100%',
  },
});