// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { BehaviorAnalyzer } from '../utils/behaviorAnalyzer';
// import { behaviorService } from '../services/behaviorService';
// import { useAuth } from './AuthContext';
// import { ALERT_LEVELS } from '../utils/constants';

// const BehaviorContext = createContext(null);

// export const useBehavior = () => {
//     const context = useContext(BehaviorContext);
//     if (!context) {
//         throw new Error('useBehavior must be used within BehaviorProvider');
//     }
//     return context;
// };

// export const BehaviorProvider = ({ children }) => {
//     const { user } = useAuth();
//     const [alertLevel, setAlertLevel] = useState(ALERT_LEVELS.GREEN);
//     const [currentAlert, setCurrentAlert] = useState(null);
//     const [isMonitoring, setIsMonitoring] = useState(false);
//     const [firstFeatureUsed, setFirstFeatureUsed] = useState(null);
//     const [interactionData, setInteractionData] = useState({
//         mouseMovements: 0,
//         keystrokes: 0,
//         clicks: 0
//     });
//     const analyzerRef = useRef(null);
//     const checkIntervalRef = useRef(null);
//     const currentUserRef = useRef(null);

//     // CRITICAL: Clear interval helper
//     const clearCheckInterval = () => {
//         if (checkIntervalRef.current) {
//             console.log(`[BehaviorContext] 🛑 Clearing interval ${checkIntervalRef.current}`);
//             clearInterval(checkIntervalRef.current);
//             checkIntervalRef.current = null;
//         }
//     };

//     // Initialize analyzer for each user
//     useEffect(() => {
//         if (user && user.id !== currentUserRef.current) {
//             // User changed - clear old monitoring
//             clearCheckInterval();

//             analyzerRef.current = new BehaviorAnalyzer();
//             currentUserRef.current = user.id;
//             console.log(`[BehaviorContext] ✅ Initialized for user ${user.id}`);
//         } else if (!user && currentUserRef.current) {
//             // User logged out
//             console.log(`[BehaviorContext] 🚪 User logged out`);
//             clearCheckInterval();
//             currentUserRef.current = null;
//             setIsMonitoring(false);
//         }
//     }, [user?.id]);

//     // Start monitoring
//     const startMonitoring = () => {
//         // ALWAYS clear existing interval first
//         clearCheckInterval();

//         if (!user) {
//             console.log(`[BehaviorContext] ⏭️ No user`);
//             return;
//         }

//         if (user.role === 'admin') {
//             console.log(`[BehaviorContext] ⏭️ Admin user`);
//             return;
//         }

//         console.log(`[BehaviorContext] 🚀 Start monitoring user ${user.id}`);

//         setIsMonitoring(true);

//         if (analyzerRef.current) {
//             analyzerRef.current.reset();
//         }

//         if (user.completedDemo) {
//             const baseline = behaviorService.getBehaviorProfile(user.id);

//             if (baseline) {
//                 console.log(`[BehaviorContext] ✅ Starting checks (30s interval)`);

//                 checkIntervalRef.current = setInterval(() => {
//                     if (currentUserRef.current === user.id) {
//                         checkBehavior();
//                     }
//                 }, 30000);
//             }
//         }
//     };

//     // Stop monitoring
//     const stopMonitoring = () => {
//         console.log(`[BehaviorContext] ⏹️ Stop monitoring`);
//         clearCheckInterval();
//         setIsMonitoring(false);
//     };

//     // Save baseline
//     const saveBaseline = () => {
//         if (!user || !analyzerRef.current) return;

//         const baseline = analyzerRef.current.getBaselineProfile();

//         const enhancedBaseline = {
//             ...baseline,
//             firstFeature: firstFeatureUsed,
//             interactionData: { ...interactionData },
//             sessionDuration: Date.now() - analyzerRef.current.sessionStartTime,
//             userAgent: navigator.userAgent,
//             screenResolution: `${window.screen.width}x${window.screen.height}`
//         };

//         behaviorService.saveBaselineProfile(user.id, enhancedBaseline);
//         console.log(`[BehaviorContext] ✅ Saved baseline`);
//     };

//     // Check behavior
//     const checkBehavior = () => {
//         const userId = currentUserRef.current;

//         if (!userId || !user || user.id !== userId) {
//             clearCheckInterval();
//             return;
//         }

//         if (user.role === 'admin' || !user.completedDemo || !analyzerRef.current) {
//             return;
//         }

//         const baseline = behaviorService.getBehaviorProfile(userId);

//         if (!baseline) return;
//         if (baseline.userId && baseline.userId !== userId) return;

//         // Reduce logging - only log if alerts found
//         const alerts = analyzerRef.current.compareBehavior(baseline);

//         if (alerts.length > 0) {
//             console.log(`[BehaviorContext] ⚠️ ${alerts.length} alert(s) for user ${userId}`);

//             alerts.forEach(alert => {
//                 const savedAlert = behaviorService.addAlert(userId, alert);

//                 if (savedAlert.accountLocked) {
//                     setCurrentAlert({ ...savedAlert, accountLocked: true });
//                     stopMonitoring();
//                 } else {
//                     setCurrentAlert(savedAlert);
//                 }
//             });

//             const level = behaviorService.getAlertLevel(userId);
//             setAlertLevel(level);
//         }
//     };

//     // Track first feature
//     const trackFirstFeature = (feature) => {
//         if (!user) return;

//         if (!firstFeatureUsed) {
//             setFirstFeatureUsed(feature);
//         } else if (user.completedDemo) {
//             const baseline = behaviorService.getBehaviorProfile(user.id);

//             if (!baseline) return;
//             if (baseline.userId && baseline.userId !== user.id) return;

//             if (baseline.firstFeature && baseline.firstFeature !== feature) {
//                 const alert = behaviorService.checkFirstFeature(user.id, feature, baseline.firstFeature);
//                 if (alert) {
//                     if (alert.accountLocked) {
//                         setCurrentAlert({ ...alert, accountLocked: true });
//                         stopMonitoring();
//                     } else {
//                         setCurrentAlert(alert);
//                     }
//                     setAlertLevel(behaviorService.getAlertLevel(user.id));
//                 }
//             }
//         }

//         setInteractionData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
//     };

//     const clearAlert = () => setCurrentAlert(null);

//     // Event handlers
//     useEffect(() => {
//         if (!isMonitoring || !analyzerRef.current || !user) return;

//         const handleMouseMove = (e) => {
//             analyzerRef.current.trackMouseMovement(e);
//             setInteractionData(prev => ({ ...prev, mouseMovements: prev.mouseMovements + 1 }));
//         };

//         window.addEventListener('mousemove', handleMouseMove);
//         return () => window.removeEventListener('mousemove', handleMouseMove);
//     }, [isMonitoring, user]);

//     useEffect(() => {
//         if (!isMonitoring || !analyzerRef.current || !user) return;

//         const handleKeyDown = (e) => {
//             analyzerRef.current.trackKeystroke(e);
//             setInteractionData(prev => ({ ...prev, keystrokes: prev.keystrokes + 1 }));
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [isMonitoring, user]);

//     useEffect(() => {
//         if (!isMonitoring || !analyzerRef.current || !user) return;

//         const handleVisibilityChange = () => {
//             if (document.hidden) {
//                 analyzerRef.current.trackWindowSwitch();
//             }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);
//         return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//     }, [isMonitoring, user]);

//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             console.log(`[BehaviorContext] 🧹 Component unmounting, cleanup`);
//             clearCheckInterval();
//         };
//     }, []);

//     // Stop monitoring when user logs out
//     useEffect(() => {
//         if (!user) {
//             stopMonitoring();
//             setFirstFeatureUsed(null);
//             setInteractionData({ mouseMovements: 0, keystrokes: 0, clicks: 0 });
//             setAlertLevel(ALERT_LEVELS.GREEN);
//             setCurrentAlert(null);
//         }
//     }, [user]);

//     const value = {
//         alertLevel,
//         currentAlert,
//         isMonitoring,
//         firstFeatureUsed,
//         interactionData,
//         startMonitoring,
//         stopMonitoring,
//         saveBaseline,
//         trackFirstFeature,
//         clearAlert
//     };

//     return (
//         <BehaviorContext.Provider value={value}>
//             {children}
//         </BehaviorContext.Provider>
//     );
// };      







import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { BehaviorAnalyzer } from '../utils/behaviorAnalyzer';
import { behaviorService } from '../services/behaviorService';
import { useAuth } from './AuthContext';
import { ALERT_LEVELS } from '../utils/constants';

const BehaviorContext = createContext(null);

export const useBehavior = () => {
    const context = useContext(BehaviorContext);
    if (!context) {
        throw new Error('useBehavior must be used within BehaviorProvider');
    }
    return context;
};

export const BehaviorProvider = ({ children }) => {
    const { user } = useAuth();
    const [alertLevel, setAlertLevel] = useState(ALERT_LEVELS.GREEN);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [firstFeatureUsed, setFirstFeatureUsed] = useState(null);
    const [sessionFirstFeatureChecked, setSessionFirstFeatureChecked] = useState(false);
    const [interactionData, setInteractionData] = useState({
        mouseMovements: 0,
        keystrokes: 0,
        clicks: 0
    });

    const analyzerRef = useRef(null);
    const checkIntervalRef = useRef(null);
    const currentUserRef = useRef(null);

    // Clear interval helper
    const clearCheckInterval = useCallback(() => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    }, []);

    // Initialize analyzer when user changes
    useEffect(() => {
        if (user && user.id !== currentUserRef.current) {
            console.log(`[BehaviorContext] 🔄 User changed to ${user.id}`);
            clearCheckInterval();
            analyzerRef.current = new BehaviorAnalyzer();
            currentUserRef.current = user.id;
            setIsMonitoring(false);
            setFirstFeatureUsed(null); // Reset for new session
            setSessionFirstFeatureChecked(false); // Reset flag
        } else if (!user && currentUserRef.current) {
            console.log(`[BehaviorContext] 🚪 User logged out`);
            clearCheckInterval();
            currentUserRef.current = null;
            setIsMonitoring(false);
            setFirstFeatureUsed(null);
            setSessionFirstFeatureChecked(false);
        }
    }, [user?.id, clearCheckInterval]);

    // Check behavior
    const checkBehavior = useCallback(() => {
        const userId = currentUserRef.current;
        const currentUser = user;

        if (!userId || !currentUser || currentUser.id !== userId) {
            clearCheckInterval();
            return;
        }

        if (currentUser.role === 'admin' || !currentUser.completedDemo || !analyzerRef.current) {
            return;
        }

        const baseline = behaviorService.getBehaviorProfile(userId);

        if (!baseline) return;
        if (baseline.userId && baseline.userId !== userId) return;

        const alerts = analyzerRef.current.compareBehavior(baseline);

        if (alerts.length > 0) {
            console.log(`[BehaviorContext] ⚠️ ${alerts.length} alert(s) for user ${userId}`);

            alerts.forEach(alert => {
                const savedAlert = behaviorService.addAlert(userId, alert);

                if (savedAlert.accountLocked) {
                    setCurrentAlert({ ...savedAlert, accountLocked: true });
                    clearCheckInterval();
                    setIsMonitoring(false);
                } else {
                    setCurrentAlert(savedAlert);
                }
            });

            const level = behaviorService.getAlertLevel(userId);
            setAlertLevel(level);
        }
    }, [user, clearCheckInterval]);

    // Start monitoring
    const startMonitoring = useCallback(() => {
        clearCheckInterval();

        if (!user) {
            console.log(`[BehaviorContext] ⏭️ No user`);
            return;
        }

        if (user.role === 'admin') {
            console.log(`[BehaviorContext] ⏭️ Admin user`);
            return;
        }

        console.log(`[BehaviorContext] 🚀 Start monitoring user ${user.id}, completedDemo: ${user.completedDemo}`);

        setIsMonitoring(true);

        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }

        if (user.completedDemo) {
            const baseline = behaviorService.getBehaviorProfile(user.id);

            if (baseline) {
                console.log(`[BehaviorContext] ✅ Starting behavior checks (30s interval)`);

                checkIntervalRef.current = setInterval(() => {
                    if (currentUserRef.current === user.id) {
                        checkBehavior();
                    }
                }, 30000);
            } else {
                console.log(`[BehaviorContext] ⚠️ No baseline found for user ${user.id}`);
            }
        } else {
            console.log(`[BehaviorContext] ℹ️ Demo mode - behavior checks DISABLED`);
        }
    }, [user, clearCheckInterval, checkBehavior]);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        console.log(`[BehaviorContext] ⏹️ Stop monitoring`);
        clearCheckInterval();
        setIsMonitoring(false);
    }, [clearCheckInterval]);

    // Save baseline
    const saveBaseline = useCallback(() => {
        if (!user || !analyzerRef.current) {
            console.log(`[BehaviorContext] ⚠️ Cannot save baseline - no user or analyzer`);
            return;
        }

        const baseline = analyzerRef.current.getBaselineProfile();

        const enhancedBaseline = {
            ...baseline,
            firstFeature: firstFeatureUsed,
            interactionData: { ...interactionData },
            sessionDuration: Date.now() - analyzerRef.current.sessionStartTime,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`
        };

        behaviorService.saveBaselineProfile(user.id, enhancedBaseline);
        console.log(`[BehaviorContext] ✅ Saved baseline for user ${user.id}`, {
            firstFeature: firstFeatureUsed,
            mouseSpeed: baseline.mouseSpeed,
            keystrokeSpeed: baseline.keystrokeSpeed
        });
    }, [user, firstFeatureUsed, interactionData]);

    // Track first feature - PROPERLY FIXED
    const trackFirstFeature = useCallback((feature) => {
        if (!user) return;

        console.log(`[BehaviorContext] 📍 Feature: ${feature} | completedDemo: ${user.completedDemo} | sessionFirstFeatureChecked: ${sessionFirstFeatureChecked} | firstFeatureUsed: ${firstFeatureUsed}`);

        // DURING DEMO MODE - just track, no alerts
        if (!user.completedDemo) {
            if (!firstFeatureUsed) {
                console.log(`[BehaviorContext] 🎓 Demo - First feature: ${feature}`);
                setFirstFeatureUsed(feature);
            } else {
                console.log(`[BehaviorContext] 🎓 Demo - Feature clicked: ${feature} (no check)`);
            }
            setInteractionData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
            return;
        }

        // AFTER DEMO - check against baseline
        // BUT: Only check if this is the FIRST feature in THIS session
        if (!sessionFirstFeatureChecked) {
            console.log(`[BehaviorContext] 🔍 First feature this session: ${feature}`);
            setSessionFirstFeatureChecked(true);
            setFirstFeatureUsed(feature);

            const baseline = behaviorService.getBehaviorProfile(user.id);

            if (!baseline) {
                console.log(`[BehaviorContext] ⏭️ No baseline found - skipping check`);
                setInteractionData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
                return;
            }

            if (baseline.userId && baseline.userId !== user.id) {
                console.log(`[BehaviorContext] ⚠️ Baseline user mismatch - skipping`);
                setInteractionData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
                return;
            }

            // NOW check if it matches the baseline
            if (baseline.firstFeature && baseline.firstFeature !== feature) {
                console.log(`[BehaviorContext] 🚨 ALERT! Expected: ${baseline.firstFeature}, Got: ${feature}`);

                const alert = behaviorService.checkFirstFeature(user.id, feature, baseline.firstFeature);
                if (alert) {
                    if (alert.accountLocked) {
                        setCurrentAlert({ ...alert, accountLocked: true });
                        stopMonitoring();
                    } else {
                        setCurrentAlert(alert);
                    }
                    setAlertLevel(behaviorService.getAlertLevel(user.id));
                }
            } else {
                console.log(`[BehaviorContext] ✅ First feature matches baseline: ${feature}`);
            }
        } else {
            // Subsequent features in this session - just track, no check
            console.log(`[BehaviorContext] ➡️ Subsequent feature: ${feature} (no check)`);
        }

        setInteractionData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    }, [user, firstFeatureUsed, sessionFirstFeatureChecked, stopMonitoring]);

    // Clear alert
    const clearAlert = useCallback(() => {
        setCurrentAlert(null);
    }, []);

    // Mouse move handler
    useEffect(() => {
        if (!isMonitoring || !analyzerRef.current || !user) return;

        const handleMouseMove = (e) => {
            analyzerRef.current.trackMouseMovement(e);
            setInteractionData(prev => ({ ...prev, mouseMovements: prev.mouseMovements + 1 }));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMonitoring, user]);

    // Keyboard handler
    useEffect(() => {
        if (!isMonitoring || !analyzerRef.current || !user) return;

        const handleKeyDown = (e) => {
            analyzerRef.current.trackKeystroke(e);
            setInteractionData(prev => ({ ...prev, keystrokes: prev.keystrokes + 1 }));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMonitoring, user]);

    // Visibility change handler
    useEffect(() => {
        if (!isMonitoring || !analyzerRef.current || !user) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                analyzerRef.current.trackWindowSwitch();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isMonitoring, user]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log(`[BehaviorContext] 🧹 Component unmounting, cleanup`);
            clearCheckInterval();
        };
    }, [clearCheckInterval]);

    // Stop monitoring when user logs out
    useEffect(() => {
        if (!user) {
            stopMonitoring();
            setFirstFeatureUsed(null);
            setSessionFirstFeatureChecked(false);
            setInteractionData({ mouseMovements: 0, keystrokes: 0, clicks: 0 });
            setAlertLevel(ALERT_LEVELS.GREEN);
            setCurrentAlert(null);
        }
    }, [user, stopMonitoring]);

    const value = {
        alertLevel,
        currentAlert,
        isMonitoring,
        firstFeatureUsed,
        interactionData,
        startMonitoring,
        stopMonitoring,
        saveBaseline,
        trackFirstFeature,
        clearAlert
    };

    return (
        <BehaviorContext.Provider value={value}>
            {children}
        </BehaviorContext.Provider>
    );
};  