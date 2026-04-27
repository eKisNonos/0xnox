import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nox.app',
  appName: '0xNOX',
  webDir: '.',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: '0xNOX'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
