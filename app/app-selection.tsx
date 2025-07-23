import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface App {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  isBlocked: boolean;
}

export default function AppSelection() {
  const [apps, setApps] = useState<App[]>([
    { id: '1', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F', category: 'Social', isBlocked: true },
    { id: '2', name: 'TikTok', icon: 'musical-notes', color: '#000000', category: 'Social', isBlocked: true },
    { id: '3', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2', category: 'Social', isBlocked: true },
    { id: '4', name: 'YouTube', icon: 'logo-youtube', color: '#FF0000', category: 'Entertainment', isBlocked: false },
    { id: '5', name: 'Netflix', icon: 'tv', color: '#E50914', category: 'Entertainment', isBlocked: false },
    { id: '6', name: 'Spotify', icon: 'musical-note', color: '#1DB954', category: 'Music', isBlocked: false },
    { id: '7', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2', category: 'Social', isBlocked: false },
    { id: '8', name: 'Snapchat', icon: 'camera', color: '#FFFC00', category: 'Social', isBlocked: false },
  ]);

  const toggleAppBlock = (appId: string) => {
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
      )
    );
  };

  const categories = ['Social', 'Entertainment', 'Music'];
  const blockedCount = apps.filter(app => app.isBlocked).length;

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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Select Apps to Block</Text>
            <Text style={styles.headerSubtitle}>
              {blockedCount} apps currently blocked
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Animated.View 
          style={styles.quickActions}
          entering={FadeInDown.duration(600).delay(200)}
        >
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setApps(apps.map(app => ({ ...app, isBlocked: true })))}
          >
            <Text style={styles.quickActionText}>Block All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.quickActionButtonSecondary]}
            onPress={() => setApps(apps.map(app => ({ ...app, isBlocked: false })))}
          >
            <Text style={[styles.quickActionText, styles.quickActionTextSecondary]}>
              Unblock All
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Apps by Category */}
        {categories.map((category, categoryIndex) => {
          const categoryApps = apps.filter(app => app.category === category);
          
          return (
            <Animated.View
              key={category}
              style={styles.categorySection}
              entering={FadeInDown.duration(600).delay(400 + categoryIndex * 200)}
            >
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.appsContainer}>
                {categoryApps.map((app, index) => (
                  <Animated.View
                    key={app.id}
                    style={styles.appItem}
                    entering={FadeInDown.duration(400).delay(600 + categoryIndex * 200 + index * 100)}
                  >
                    <View style={styles.appInfo}>
                      <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                        <Ionicons name={app.icon as any} size={24} color="white" />
                      </View>
                      <View style={styles.appDetails}>
                        <Text style={styles.appName}>{app.name}</Text>
                        <Text style={styles.appCategory}>{app.category}</Text>
                      </View>
                    </View>
                    <Switch
                      value={app.isBlocked}
                      onValueChange={() => toggleAppBlock(app.id)}
                      trackColor={{ false: '#E5E5E7', true: '#FF6B35' }}
                      thumbColor={app.isBlocked ? 'white' : '#f4f3f4'}
                      ios_backgroundColor="#E5E5E7"
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          );
        })}

        {/* Info Card */}
        <Animated.View 
          style={styles.infoCard}
          entering={FadeInDown.duration(600).delay(1000)}
        >
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color="#4ECDC4" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Blocked apps will require you to complete 10 pushups before you can access them. 
              The camera will verify your form in real-time.
            </Text>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View 
          style={styles.saveSection}
          entering={FadeInDown.duration(600).delay(1200)}
        >
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.saveGradient}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickActionTextSecondary: {
    color: '#FF6B35',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1B23',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  appsContainer: {
    paddingHorizontal: 20,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  saveSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});