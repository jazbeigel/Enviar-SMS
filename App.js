import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const sanitizePhoneNumber = (value) => value.replace(/[^0-9+#*]/g, '');

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const sanitizedNumber = useMemo(
    () => sanitizePhoneNumber(phoneNumber),
    [phoneNumber],
  );

  const handleCall = useCallback(async () => {
    if (!sanitizedNumber) {
      Alert.alert('Número requerido', 'Ingresa un número telefónico válido.');
      return;
    }

    const telUrl = `tel:${sanitizedNumber}`;

    try {
      // Fallback para web
      if (Platform.OS === 'web') {
        window.location.href = telUrl;
        return;
      }

      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        Alert.alert('Acción no soportada', 'No es posible realizar llamadas desde este dispositivo.');
        return;
      }

      await Linking.openURL(telUrl);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar iniciar la llamada.');
    }
  }, [sanitizedNumber]);

  const handleSms = useCallback(async () => {
    if (!sanitizedNumber) {
      Alert.alert('Número requerido', 'Ingresa un número telefónico válido.');
      return;
    }

    const trimmedMessage = message.trim();
    const encodedMessage = encodeURIComponent(trimmedMessage);
    const bodyParameter = trimmedMessage
      ? Platform.select({ ios: `&body=${encodedMessage}`, default: `?body=${encodedMessage}` })
      : '';
    const smsUrl = `sms:${sanitizedNumber}${bodyParameter}`;

    try {
      // Fallback para web
      if (Platform.OS === 'web') {
        window.location.href = smsUrl;
        return;
      }

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (!canOpen) {
        Alert.alert('Acción no soportada', 'No es posible enviar SMS desde este dispositivo.');
        return;
      }

      await Linking.openURL(smsUrl);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar preparar el mensaje.');
    }
  }, [message, sanitizedNumber]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.title}>Llamadas y SMS</Text>
        <Text style={styles.subtitle}>
          Ingresa un número telefónico para realizar una llamada o redactar un SMS.
        </Text>

        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Número telefónico"
          placeholderTextColor="#6b7280"
          maxLength={20}
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Mensaje opcional para SMS"
          placeholderTextColor="#6b7280"
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.callButton]} onPress={handleCall}>
            <Text style={styles.buttonText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.smsButton]} onPress={handleSms}>
            <Text style={styles.buttonText}>Enviar SMS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  smsButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
