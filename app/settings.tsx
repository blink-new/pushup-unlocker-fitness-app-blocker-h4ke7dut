import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'value' | 'action';
  value?: boolean | number | string;
  icon: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'pushup_count',
      title: 'Required Pushups',
      subtitle: 'Number of pushups needed to unlock apps',
      type: 'value',
      value: 10,
      icon: 'fitness',
    },
    {
      id: 'strict_form',
      title: 'Strict Form Detection',
      subtitle: 'Require perfect pushup form',
      type: 'toggle',
      value: true,
      icon: 'checkmark-circle',
    },
    {
      id: 'haptic_feedback',
      title: 'Haptic Feedback',
      subtitle: 'Vibrate on successful pushup detection',
      type: 'toggle',
      value: true,
      icon: 'phone-portrait',
    },
    {
      id: 'daily_reminder',
      title: 'Daily Reminders',
      subtitle: 'Get notified to stay active',
      type: 'toggle',
      value: false,
      icon: 'notifications',
    },
    {
      id: 'auto_lock',
      title: 'Auto-lock After Use',
      subtitle: 'Re-block apps after 30 minutes of use',
      type: 'toggle',
      value: false,
      icon: 'time',
    },
  ]);

  const [stats] = useState({
    totalPushups: 247,
    daysActive: 12,
    appsUnlocked: 34,
    averageDaily: 21,
  });

  const toggleSetting = (settingId: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId && setting.type === 'toggle'
          ? { ...setting, value: !setting.value }
          : setting
      )
    );
  };

  const adjustPushupCount = (increment: boolean) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === 'pushup_count'
          ? { 
              ...setting, 
              value: Math.max(5, Math.min(50, (setting.value as number) + (increment ? 5 : -5)))
            }
          : setting
      )
    );
  };

  const resetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Statistics Reset', 'Your progress has been reset.');
        }},
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your fitness data has been exported to your device.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8A65']}
        style={styles.header}
      >
        <Animated.View 
          style={styles.headerContent}
          entering={FadeInUp.duration(600)}
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <Animated.View 
          style={styles.statsSection}
          entering={FadeInDown.duration(600).delay(200)}
        >
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPushups}</Text>
              <Text style={styles.statLabel}>Total Pushups</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.daysActive}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.appsUnlocked}</Text>
              <Text style={styles.statLabel}>Apps Unlocked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageDaily}</Text>
              <Text style={styles.statLabel}>Daily Average</Text>
            </View>
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View 
          style={styles.settingsSection}
          entering={FadeInDown.duration(600).delay(400)}
        >
          <Text style={styles.sectionTitle}>Challenge Settings</Text>
          <View style={styles.settingsContainer}>
            {settings.map((setting, index) => (
              <Animated.View
                key={setting.id}
                style={styles.settingItem}
                entering={FadeInDown.duration(400).delay(600 + index * 100)}
              >
                <View style={styles.settingInfo}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={setting.icon as any} size={20} color="#FF6B35" />
                  </View>
                  <View style={styles.settingDetails}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    {setting.subtitle && (
                      <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                    )}
                  </View>
                </View>
                
                {setting.type === 'toggle' && (
                  <Switch
                    value={setting.value as boolean}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: '#E5E5E7', true: '#FF6B35' }}
                    thumbColor={setting.value ? 'white' : '#f4f3f4'}
                    ios_backgroundColor="#E5E5E7"
                  />
                )}
                
                {setting.type === 'value' && setting.id === 'pushup_count' && (
                  <View style={styles.valueControls}>
                    <TouchableOpacity 
                      style={styles.valueButton}
                      onPress={() => adjustPushupCount(false)}
                    >
                      <Ionicons name="remove" size={16} color="#FF6B35" />
                    </TouchableOpacity>
                    <Text style={styles.valueText}>{setting.value}</Text>
                    <TouchableOpacity 
                      style={styles.valueButton}
                      onPress={() => adjustPushupCount(true)}
                    >
                      <Ionicons name="add" size={16} color="#FF6B35" />
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Data Management */}
        <Animated.View 
          style={styles.dataSection}
          entering={FadeInDown.duration(600).delay(800)}
        >
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.dataContainer}>
            <TouchableOpacity 
              style={styles.dataButton}
              onPress={exportData}
            >
              <View style={styles.dataButtonContent}>
                <Ionicons name="download" size={20} color="#4ECDC4" />
                <Text style={styles.dataButtonText}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dataButton, styles.dangerButton]}
              onPress={resetStats}
            >
              <View style={styles.dataButtonContent}>
                <Ionicons name="refresh" size={20} color="#FF4757" />
                <Text style={[styles.dataButtonText, styles.dangerText]}>Reset Statistics</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View 
          style={styles.aboutSection}
          entering={FadeInDown.duration(600).delay(1000)}
        >
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>2024.01.22</Text>
            </View>
          </View>
          
          <Text style={styles.aboutDescription}>
            Pushup Unlocker helps you stay fit by requiring physical exercise before accessing your favorite apps. 
            Built with computer vision and motivation in mind.
          </Text>
        </Animated.View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1B23',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  valueControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    minWidth: 24,
    textAlign: 'center',
  },
  dataSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dataContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dataButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
  },
  dangerText: {
    color: '#FF4757',
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aboutContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 16,
    color: '#1A1B23',
    fontWeight: '600',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    height: 40,
  },
});