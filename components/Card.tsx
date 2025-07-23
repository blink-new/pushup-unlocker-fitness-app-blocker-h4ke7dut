import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  gradient?: string[];
  children?: React.ReactNode;
}

export function Card({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  gradient = ['#FF6B35', '#FF8A65'],
  children 
}: CardProps) {
  const CardContent = (
    <Animated.View 
      style={styles.card}
      entering={FadeInDown.duration(400)}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          style={styles.gradientCard}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={32} color="white" />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.plainCard}>
          {icon && (
            <View style={[styles.iconContainer, styles.plainIcon]}>
              <Ionicons name={icon as any} size={32} color="#FF6B35" />
            </View>
          )}
          <Text style={[styles.title, styles.plainTitle]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, styles.plainSubtitle]}>{subtitle}</Text>}
          {children}
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradientCard: {
    padding: 24,
    alignItems: 'center',
  },
  plainCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  plainIcon: {
    backgroundColor: '#FFF5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  plainTitle: {
    color: '#1A1B23',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  plainSubtitle: {
    color: '#666',
  },
});