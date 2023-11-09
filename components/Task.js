import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const Task = ({ task, onDelete, onDeadlineSet }) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  let timeNoSeconds = date.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    onDeadlineSet(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View style={styles.task}>
      <Text style={styles.asia}>{task}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.column}>
          <Button title={`${date.toLocaleDateString('en-GB')}`} onPress={showDatepicker} color="#7a7068" style={styles.button} />
        </View>
        <View style={styles.column}>
          <Button title={timeNoSeconds} onPress={showTimepicker} color="#7a7068" style={styles.button} />
        </View>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          display="spinner"
          is24Hour={true}
          onChange={onChange}
        />
      )}
      <Button title="Poista" onPress={onDelete} color='red' />
    </View>
  );
};

const styles = StyleSheet.create({
  task: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 30,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
  },
  button: {
    marginRight: 10,
  },
  asia: {
    fontSize: 20,
    color: 'black',
    flexDirection: 'column',
  },
  deadline: {
    fontSize: 20,
    color: 'black',
  },
});

export default Task;