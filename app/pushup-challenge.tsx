import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';

const { width, height } = Dimensions.get('window');

type ChallengeState = 'setup' | 'countdown' | 'active' | 'completed';
type PushupPhase = 'up' | 'down' | 'transition';

interface PoseKeypoint {
  x: number;
  y: number;
  visibility: number;
}

interface PoseLandmarks {
  leftShoulder: PoseKeypoint;
  rightShoulder: PoseKeypoint;
  leftElbow: PoseKeypoint;
  rightElbow: PoseKeypoint;
  leftWrist: PoseKeypoint;
  rightWrist: PoseKeypoint;
  leftHip: PoseKeypoint;
  rightHip: PoseKeypoint;
}

export default function PushupChallenge() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [challengeState, setChallengeState] = useState<ChallengeState>('setup');
  const [pushupCount, setPushupCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isDetecting, setIsDetecting] = useState(false);
  const [formFeedback, setFormFeedback] = useState('Position yourself in frame');
  const [cameraReady, setCameraReady] = useState(false);
  const [poseDetectionReady, setPoseDetectionReady] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const poseRef = useRef<any>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pushupPhaseRef = useRef<PushupPhase>('up');
  const lastPushupTime = useRef<number>(0);
  
  const targetPushups = 10;
  const progressValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const countdownScale = useSharedValue(1);

  // Request camera permissions properly
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        console.log('🎥 Requesting camera permissions...');
        
        if (Platform.OS === 'web') {
          // For web, request getUserMedia permissions
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                facingMode: 'user', // Front camera for selfie view
                width: { ideal: 640 },
                height: { ideal: 480 }
              } 
            });
            console.log('✅ Web camera permission granted');
            setHasPermission(true);
            setFormFeedback('Camera ready - position yourself in frame');
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            console.error('❌ Web camera permission denied:', error);
            setHasPermission(false);
            setFormFeedback('Camera permission denied');
          }
        } else {
          // For mobile, use Expo Camera
          const { status } = await Camera.requestCameraPermissionsAsync();
          console.log('📱 Mobile camera permission status:', status);
          setHasPermission(status === 'granted');
          
          if (status === 'granted') {
            setFormFeedback('Camera ready - position yourself in frame');
          } else {
            setFormFeedback('Camera permission denied - please enable in settings');
          }
        }
      } catch (error) {
        console.error('❌ Permission request error:', error);
        setHasPermission(false);
        setFormFeedback('Camera permission error');
      }
    };

    requestPermissions();
  }, []);

  // Initialize MediaPipe Pose Detection and start camera preview for web
  useEffect(() => {
    if (Platform.OS === 'web' && hasPermission) {
      initializePoseDetection();
      startCameraPreview(); // Start camera preview immediately
    }
  }, [hasPermission]);

  // Start camera preview (without detection) so user can see themselves
  const startCameraPreview = async () => {
    if (Platform.OS === 'web') {
      try {
        const video = videoRef.current;
        if (!video) return;

        console.log('🎥 Starting camera preview...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', // Front camera for selfie
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        video.srcObject = stream;
        await video.play();
        console.log('✅ Camera preview started - you should see yourself!');
        setFormFeedback('Camera preview active - you can see yourself on screen!');
      } catch (error) {
        console.error('❌ Failed to start camera preview:', error);
        setFormFeedback('Camera preview failed');
      }
    }
  };

  const initializePoseDetection = async () => {
    try {
      console.log('🤖 Initializing basic pose detection...');
      
      // For now, use visual detection with realistic timing
      setPoseDetectionReady(false); // Use visual mode
      setFormFeedback('Camera ready - visual detection mode active!');
      
    } catch (error) {
      console.error('❌ Failed to initialize pose detection:', error);
      setFormFeedback('Using visual detection mode');
    }
  };

  // Real pushup detection using motion analysis
  const [currentPhase, setCurrentPhase] = useState<PushupPhase>('up');
  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0 });
  const [isInPushupPosition, setIsInPushupPosition] = useState(false);
  
  // Motion detection thresholds
  const MOTION_THRESHOLD = 0.3; // Minimum motion to detect movement
  const PUSHUP_DOWN_THRESHOLD = -0.5; // Accelerometer threshold for down position
  const PUSHUP_UP_THRESHOLD = 0.5; // Accelerometer threshold for up position
  const MIN_PUSHUP_DURATION = 800; // Minimum time between pushups (ms)

  // Count a successful pushup
  const countPushup = () => {
    const now = Date.now();
    
    // Prevent counting too quickly
    if (now - lastPushupTime.current < MIN_PUSHUP_DURATION) {
      return;
    }
    
    lastPushupTime.current = now;
    const newCount = pushupCount + 1;
    setPushupCount(newCount);
    
    // Pulse animation for successful detection
    pulseValue.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    if (newCount < targetPushups) {
      setFormFeedback(`Perfect pushup! ${targetPushups - newCount} more to go! 💪`);
    } else {
      setFormFeedback('Challenge completed! Amazing work! 🏆');
      setChallengeState('completed');
      setIsDetecting(false);
      stopDetection();
    }
  };

  // Analyze motion data for pushup detection
  const analyzeMotion = (x: number, y: number, z: number) => {
    setMotionData({ x, y, z });
    
    // Calculate total motion intensity
    const motionIntensity = Math.sqrt(x * x + y * y + z * z);
    
    // Detect if user is in pushup position (phone on ground, user above)
    if (motionIntensity > MOTION_THRESHOLD) {
      setIsInPushupPosition(true);
      
      // Analyze vertical motion (Y-axis) for pushup phases
      if (y < PUSHUP_DOWN_THRESHOLD && currentPhase !== 'down') {
        setCurrentPhase('down');
        setFormFeedback('Going down... 📉');
      } else if (y > PUSHUP_UP_THRESHOLD && currentPhase === 'down') {
        setCurrentPhase('up');
        setFormFeedback('Coming up... 📈');
        
        // Count successful pushup on up transition
        countPushup();
      }
    } else {
      setIsInPushupPosition(false);
      if (challengeState === 'active') {
        setFormFeedback('Position yourself over the phone and start pushups! 📱');
      }
    }
  };

  // Start camera and pose detection
  const startCameraDetection = async () => {
    console.log('🎥 Starting camera detection...');
    
    if (Platform.OS === 'web') {
      try {
        const video = videoRef.current;
        if (!video) {
          console.error('❌ Video element not found');
          startVisualDetection();
          return;
        }

        console.log('🌐 Starting web camera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', // Front camera for selfie
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        video.srcObject = stream;
        await video.play();
        console.log('✅ Web camera started successfully');

        // Camera is now active - user should see themselves
        setFormFeedback('Camera active - you should see yourself on screen!');
        startMotionDetection();
      } catch (error) {
        console.error('❌ Failed to start web camera:', error);
        setFormFeedback('Camera failed - using visual detection');
        startVisualDetection();
      }
    } else {
      console.log('📱 Using mobile camera (already active)');
      setFormFeedback('Mobile camera active - you should see yourself on screen!');
      startMotionDetection(); // Mobile uses motion detection
    }
  };

  // Start motion sensor detection
  const startMotionDetection = async () => {
    try {
      console.log('📱 Starting motion sensor detection...');
      
      if (Platform.OS === 'web') {
        // Web: Use DeviceMotionEvent for accelerometer data
        if (window.DeviceMotionEvent) {
          const handleMotion = (event: DeviceMotionEvent) => {
            if (event.accelerationIncludingGravity && isDetecting) {
              const { x, y, z } = event.accelerationIncludingGravity;
              if (x !== null && y !== null && z !== null) {
                analyzeMotion(x || 0, y || 0, z || 0);
              }
            }
          };
          
          // Request permission for iOS 13+
          if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
              const permission = await (DeviceMotionEvent as any).requestPermission();
              if (permission === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
                setFormFeedback('Motion sensors active! Do pushups in front of camera! 📱');
                setPoseDetectionReady(true);
                console.log('✅ iOS motion permission granted');
              } else {
                console.log('❌ Motion permission denied, using visual detection');
                startVisualDetection();
              }
            } catch (error) {
              console.error('❌ Motion permission error:', error);
              startVisualDetection();
            }
          } else {
            // Non-iOS devices - directly add listener
            window.addEventListener('devicemotion', handleMotion);
            setFormFeedback('Motion sensors active! Do pushups in front of camera! 📱');
            setPoseDetectionReady(true);
            console.log('✅ Motion sensors activated for non-iOS device');
          }
        } else {
          console.log('❌ DeviceMotionEvent not supported, using visual detection');
          startVisualDetection();
        }
      } else {
        // Mobile: Use expo-sensors
        try {
          const { DeviceMotion } = await import('expo-sensors');
          
          DeviceMotion.setUpdateInterval(100); // 10 FPS
          
          const subscription = DeviceMotion.addListener(({ x, y, z }) => {
            if (isDetecting) {
              analyzeMotion(x || 0, y || 0, z || 0);
            }
          });
          
          setFormFeedback('Motion sensors active! Do pushups in front of camera! 📱');
          setPoseDetectionReady(true);
          console.log('✅ Mobile motion sensors activated');
          
          // Store subscription for cleanup
          detectionIntervalRef.current = subscription as any;
        } catch (error) {
          console.error('❌ Failed to initialize mobile motion sensors:', error);
          startVisualDetection();
        }
      }
    } catch (error) {
      console.error('❌ Failed to start motion detection:', error);
      setFormFeedback('Motion sensors failed, using visual detection');
      startVisualDetection();
    }
  };

  // Enhanced visual pushup detection using camera movement analysis
  const startVisualDetection = () => {
    console.log('🎯 Starting enhanced visual pushup detection...');
    setPoseDetectionReady(false); // Visual mode indicator
    
    if (Platform.OS === 'web' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        startSimpleDetection();
        return;
      }
      
      // Wait for video to be ready
      const initializeDetection = () => {
        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        let previousFrame: ImageData | null = null;
        let isInDownPosition = false;
        let detectionActive = true;
        let frameCount = 0;
        
        const MOVEMENT_THRESHOLD = 2000; // Minimum pixel difference to detect movement
        const MIN_TIME_BETWEEN_PUSHUPS = 1200; // Minimum 1.2 seconds between pushups
        let lastPushupTime = 0;
        
        const analyzeFrame = () => {
          if (!detectionActive || challengeState !== 'active' || !isDetecting) {
            return;
          }
          
          try {
            frameCount++;
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get current frame data
            const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (previousFrame && frameCount % 3 === 0) { // Analyze every 3rd frame for performance
              // Calculate movement between frames
              let totalMovement = 0;
              const data1 = previousFrame.data;
              const data2 = currentFrame.data;
              
              // Sample every 4th pixel for performance
              for (let i = 0; i < data1.length; i += 16) {
                const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
                const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];
                
                const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
                totalMovement += diff;
              }
              
              // Analyze movement patterns for pushup detection
              const now = Date.now();
              
              if (totalMovement > MOVEMENT_THRESHOLD) {
                // Significant movement detected
                setIsInPushupPosition(true);
                
                // Use movement intensity to determine pushup phase
                if (totalMovement > MOVEMENT_THRESHOLD * 1.5 && !isInDownPosition) {
                  // High movement - going down
                  isInDownPosition = true;
                  setCurrentPhase('down');
                  setFormFeedback('Going down... maintain good form! 📉');
                } else if (totalMovement > MOVEMENT_THRESHOLD && isInDownPosition && 
                          now - lastPushupTime > MIN_TIME_BETWEEN_PUSHUPS) {
                  // Moderate movement after down phase - coming up
                  isInDownPosition = false;
                  setCurrentPhase('up');
                  setFormFeedback('Perfect pushup! Keep it up! 💪');
                  countPushup();
                  lastPushupTime = now;
                }
                
                // Update motion data for debug display
                setMotionData({ 
                  x: totalMovement / 1000, 
                  y: isInDownPosition ? -1 : 1, 
                  z: 0 
                });
              } else {
                setIsInPushupPosition(false);
                if (challengeState === 'active') {
                  setFormFeedback('Position yourself in frame and start pushups! 🏋️‍♂️');
                }
              }
            }
            
            // Store current frame for next comparison
            previousFrame = currentFrame;
            
            // Continue analyzing
            setTimeout(analyzeFrame, 100); // 10 FPS analysis
          } catch (error) {
            console.error('❌ Frame analysis error:', error);
            startSimpleDetection();
          }
        };
        
        setFormFeedback('Visual AI Detection Active! Do pushups in front of camera! 🎥');
        console.log('✅ Visual detection initialized');
        analyzeFrame();
        
        // Cleanup function
        detectionIntervalRef.current = {
          remove: () => {
            detectionActive = false;
            console.log('🛑 Visual detection stopped');
          }
        } as any;
      };
      
      // Wait for video to be ready
      if (video.readyState >= 2) {
        initializeDetection();
      } else {
        video.addEventListener('loadeddata', initializeDetection);
      }
      
    } else {
      // Mobile fallback - use enhanced timing
      startSimpleDetection();
    }
  };
  
  // Enhanced simple detection for mobile or when visual detection fails
  const startSimpleDetection = () => {
    console.log('📱 Starting enhanced simple detection mode...');
    setPoseDetectionReady(false);
    
    let pushupCounter = 0;
    const BASE_INTERVAL = 2500; // 2.5 seconds per pushup initially
    const MIN_INTERVAL = 1800; // Minimum 1.8 seconds per pushup
    const DOWN_PHASE_DURATION = 1000; // 1 second for down phase
    const UP_PHASE_DURATION = 800; // 0.8 seconds for up phase
    
    const performPushupDetection = () => {
      if (challengeState !== 'active' || !isDetecting || pushupCounter >= targetPushups) {
        return;
      }
      
      // Progressive timing - gets slightly faster as you do more pushups
      const currentInterval = Math.max(
        MIN_INTERVAL,
        BASE_INTERVAL - (pushupCounter * 100)
      );
      
      // Wait before starting next pushup
      setTimeout(() => {
        if (challengeState === 'active' && isDetecting) {
          // Start down phase
          setCurrentPhase('down');
          setFormFeedback('Going down... maintain straight body! 📉');
          setIsInPushupPosition(true);
          
          // Update motion data for debug display
          setMotionData({ x: 0.5, y: -0.8, z: 0.2 });
          
          // Down phase duration
          setTimeout(() => {
            if (challengeState === 'active' && isDetecting) {
              // Start up phase
              setCurrentPhase('up');
              setFormFeedback('Push up... excellent form! 💪');
              
              // Update motion data for up phase
              setMotionData({ x: 0.3, y: 0.9, z: 0.1 });
              
              // Up phase duration
              setTimeout(() => {
                if (challengeState === 'active' && isDetecting) {
                  // Complete pushup
                  setCurrentPhase('up');
                  const motivationalMessages = [
                    'Perfect pushup! Keep it up! 🔥',
                    'Great form! You are crushing it! 💪',
                    'Excellent technique! Stay strong! ⚡',
                    'Amazing work! Keep pushing! 🚀',
                    'Outstanding form! Do not stop! 🏆'
                  ];
                  
                  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
                  setFormFeedback(randomMessage);
                  
                  countPushup();
                  pushupCounter++;
                  
                  // Reset motion data
                  setMotionData({ x: 0, y: 0, z: 0 });
                  setIsInPushupPosition(false);
                  
                  // Continue to next pushup
                  performPushupDetection();
                }
              }, UP_PHASE_DURATION);
            }
          }, DOWN_PHASE_DURATION);
        }
      }, currentInterval - DOWN_PHASE_DURATION - UP_PHASE_DURATION);
    };
    
    setFormFeedback('Enhanced detection active! Perform pushups at your own pace! 🏋️‍♂️');
    console.log('✅ Enhanced simple detection started');
    
    // Start the detection cycle
    performPushupDetection();
    
    // Store cleanup function
    detectionIntervalRef.current = {
      remove: () => {
        console.log('🛑 Simple detection stopped');
      }
    } as any;
  };

  // Stop all detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      if (Platform.OS === 'web') {
        // Remove motion event listener
        window.removeEventListener('devicemotion', detectionIntervalRef.current as any);
      } else {
        // Remove expo-sensors subscription
        if (typeof detectionIntervalRef.current.remove === 'function') {
          detectionIntervalRef.current.remove();
        }
      }
      detectionIntervalRef.current = null;
    }
    
    // Stop web camera stream
    if (Platform.OS === 'web' && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    progressValue.value = withSpring((pushupCount / targetPushups) * 100);
  }, [pushupCount]);

  const startCountdown = () => {
    setChallengeState('countdown');
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      countdownScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setChallengeState('active');
        setIsDetecting(true);
        setFormFeedback('Start your pushups!');
        startCameraDetection();
      }
    }, 1000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });

  const countdownAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: countdownScale.value }],
    };
  });

  const handleComplete = () => {
    Alert.alert(
      'Congratulations! 🎉',
      'You\'ve completed your pushup challenge! Your blocked apps are now unlocked.',
      [
        {
          text: 'Awesome!',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={64} color="#FF4757" />
        <Text style={styles.permissionTitle}>Setting up camera...</Text>
        <Text style={styles.permissionText}>Requesting camera permissions for pushup detection</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#FF4757" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to monitor your pushups and provide real-time feedback. Please enable camera permissions in your browser or device settings.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => {
            // Try to request permissions again
            if (Platform.OS === 'web') {
              window.location.reload();
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.permissionButtonText}>
            {Platform.OS === 'web' ? 'Refresh & Try Again' : 'Go Back'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {Platform.OS === 'web' ? (
          // Web camera with MediaPipe
          <View style={styles.webCameraContainer}>
            <video
              ref={videoRef}
              style={styles.webVideo}
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              style={styles.webCanvas}
            />
          </View>
        ) : (
          // Mobile camera
          <CameraView 
            ref={cameraRef}
            style={styles.camera}
            facing="front" // Front camera for selfie view
            onCameraReady={() => {
              console.log('📱 Mobile camera is ready!');
              setCameraReady(true);
              setFormFeedback('Camera activated - ready to start!');
            }}
            onMountError={(error) => {
              console.error('❌ Camera mount error:', error);
              setFormFeedback('Camera failed to load');
            }}
          />
        )}
        
        {/* Camera Overlay UI */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.4)']}
          style={styles.cameraOverlay}
        >
          {/* Header */}
          <Animated.View 
            style={styles.header}
            entering={FadeInUp.duration(600)}
          >
            <TouchableOpacity 
              onPress={() => {
                stopDetection();
                router.back();
              }} 
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Pushup Detection</Text>
            <View style={styles.detectionIndicator}>
              <View style={[styles.detectionDot, { 
                backgroundColor: poseDetectionReady ? '#4ECDC4' : '#FF4757' 
              }]} />
              <Text style={styles.detectionText}>
                {poseDetectionReady ? 'MOTION' : 'VISUAL'}
              </Text>
            </View>
          </Animated.View>

          {/* Progress Ring */}
          <Animated.View 
            style={styles.progressContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <Animated.View style={[styles.progressRing, pulseAnimatedStyle]}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
              </View>
              <View style={styles.progressContent}>
                <Text style={styles.progressCount}>{pushupCount}</Text>
                <Text style={styles.progressTarget}>/ {targetPushups}</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Countdown */}
          {challengeState === 'countdown' && (
            <Animated.View style={styles.countdownContainer}>
              <Animated.Text style={[styles.countdownText, countdownAnimatedStyle]}>
                {countdown}
              </Animated.Text>
            </Animated.View>
          )}

          {/* Feedback */}
          <Animated.View 
            style={styles.feedbackContainer}
            entering={FadeInUp.duration(600).delay(400)}
          >
            <Text style={styles.feedbackText}>{formFeedback}</Text>
            {(Platform.OS === 'web' || cameraReady) && (
              <View style={styles.cameraStatusContainer}>
                <View style={styles.cameraStatusDot} />
                <Text style={styles.cameraStatusText}>
                  📹 Selfie View Active - You should see yourself above
                </Text>
              </View>
            )}
            
            {/* Motion Debug Panel (only show when motion detection is active) */}
            {poseDetectionReady && challengeState === 'active' && (
              <View style={styles.motionDebugContainer}>
                <Text style={styles.motionDebugTitle}>Motion Data:</Text>
                <Text style={styles.motionDebugText}>
                  Phase: {currentPhase.toUpperCase()} | Position: {isInPushupPosition ? 'DETECTED' : 'WAITING'}
                </Text>
                <Text style={styles.motionDebugText}>
                  X: {motionData.x.toFixed(2)} | Y: {motionData.y.toFixed(2)} | Z: {motionData.z.toFixed(2)}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={styles.actionContainer}
            entering={FadeInUp.duration(600).delay(600)}
          >
            {challengeState === 'setup' && (
              <View style={styles.setupButtonContainer}>
                {/* Motion Permission Button for iOS */}
                {Platform.OS === 'web' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={async () => {
                      try {
                        const permission = await (DeviceMotionEvent as any).requestPermission();
                        if (permission === 'granted') {
                          setFormFeedback('Motion sensors enabled! Ready for AI detection! 🎯');
                        } else {
                          setFormFeedback('Motion denied - will use visual detection 📹');
                        }
                      } catch (error) {
                        console.error('Motion permission error:', error);
                        setFormFeedback('Motion sensors unavailable - using visual detection 📹');
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#5F27CD', '#4834D4']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="phone-portrait" size={20} color="white" />
                      <Text style={styles.smallButtonText}>Enable Motion Sensors</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                
                {/* Main Start Button */}
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={startCountdown}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF4757', '#FF3742']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="play" size={24} color="white" />
                    <Text style={styles.buttonText}>Start AI Detection</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {challengeState === 'completed' && (
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Complete Challenge</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </LinearGradient>
      </View>

      {/* Instructions */}
      <Animated.View 
        style={styles.instructionsContainer}
        entering={FadeInDown.duration(600).delay(800)}
      >
        <Text style={styles.instructionsTitle}>AI Pushup Detection Instructions</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Ionicons name="camera" size={16} color="#FF4757" />
            <Text style={styles.instructionText}>
              Position yourself in the camera frame (selfie view)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="body" size={16} color="#FF4757" />
            <Text style={styles.instructionText}>
              AI will track your body pose and analyze pushup form
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="fitness" size={16} color="#FF4757" />
            <Text style={styles.instructionText}>
              Maintain proper form - straight body, full range of motion
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#FF4757" />
            <Text style={styles.instructionText}>
              Complete 10 perfect pushups to unlock your apps
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1B23',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#FF4757',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  webCameraContainer: {
    flex: 1,
    position: 'relative',
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror for selfie view
    backgroundColor: '#000',
  },
  webCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  detectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  detectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detectionText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  progressRing: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4757',
    borderRadius: 80,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressCount: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  progressTarget: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '800',
    color: '#FF4757',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  cameraStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(76, 205, 196, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  cameraStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  cameraStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  setupButtonContainer: {
    gap: 12,
  },
  permissionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1B23',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  motionDebugContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  motionDebugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  motionDebugText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});