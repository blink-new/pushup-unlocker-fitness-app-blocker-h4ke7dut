import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface BlockedApp {
  id: string;
  name: string;
  icon: string;
  isBlocked: boolean;
  color: string;
}

export default function Home() {
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([
    { id: '1', name: 'Instagram', icon: 'logo-instagram', isBlocked: true, color: '#E4405F' },
    { id: '2', name: 'TikTok', icon: 'musical-notes', isBlocked: true, color: '#000000' },
    { id: '3', name: 'Twitter', icon: 'logo-twitter', isBlocked: true, color: '#1DA1F2' },
    { id: '4', name: 'YouTube', icon: 'logo-youtube', isBlocked: false, color: '#FF0000' },
  ]);

  const [dailyStats, setDailyStats] = useState({
    pushupsDone: 30,
    appsUnlocked: 3,
    streak: 7,
  });

  const blockedCount = blockedApps.filter(app => app.isBlocked).length;

  const handleQuickChallenge = () => {
    router.push('/pushup-challenge');
  };

  const handleAppSelection = () => {
    router.push('/app-selection');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <LinearGradient
      colors={['#FF6B35', '#FF8A65']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInUp.duration(600)}
        >
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Good Morning!</Text>
            <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Ready for your fitness challenge?</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View 
          style={styles.statsContainer}
          entering={FadeInDown.duration(600).delay(200)}
        >
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dailyStats.pushupsDone}</Text>
              <Text style={styles.statLabel}>Pushups Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dailyStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Blocked Apps Section */}
        <Animated.View 
          style={styles.blockedSection}
          entering={FadeInDown.duration(600).delay(400)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blocked Apps ({blockedCount})</Text>
            <TouchableOpacity onPress={handleAppSelection}>
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appsGrid}>
            {blockedApps.map((app, index) => (
              <Animated.View
                key={app.id}
                style={[styles.appCard, app.isBlocked && styles.blockedAppCard]}
                entering={FadeInDown.duration(400).delay(600 + index * 100)}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Ionicons name={app.icon as any} size={24} color="white" />
                </View>
                <Text style={[styles.appName, app.isBlocked && styles.blockedAppName]}>
                  {app.name}
                </Text>
                {app.isBlocked && (
                  <View style={styles.lockIcon}>
                    <Ionicons name="lock-closed" size={16} color="#FF6B35" />
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Challenge Button */}
        <Animated.View 
          style={styles.challengeSection}
          entering={FadeInDown.duration(600).delay(800)}
        >
          <TouchableOpacity 
            style={styles.challengeButton}
            onPress={handleQuickChallenge}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.challengeGradient}
            >
              <Ionicons name="fitness" size={32} color="white" />
              <Text style={styles.challengeButtonText}>Start Pushup Challenge</Text>
              <Text style={styles.challengeSubtext}>Unlock your apps with 10 pushups</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Motivation Quote */}
        <Animated.View 
          style={styles.motivationCard}
          entering={FadeInDown.duration(600).delay(1000)}
        >
          <Text style={styles.motivationText}>
            "The only bad workout is the one that didn't happen."
          </Text>
          <Text style={styles.motivationAuthor}>- Unknown</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  blockedSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1B23',
  },
  manageText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  appCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  blockedAppCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1B23',
    textAlign: 'center',
  },
  blockedAppName: {
    color: '#666',
  },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  challengeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
  },
  challengeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  challengeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});