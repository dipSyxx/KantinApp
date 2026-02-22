import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type BottomSheetProps = {
  visible: boolean;
  enableSwipeDown?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const SHEET_MIN_HEIGHT = 420;
const SHEET_MAX_HEIGHT_RATIO = 0.78;
const SHEET_TOP_GAP = 24;
const SHEET_HIDDEN_EXTRA_OFFSET = 32;
const SWIPE_CLOSE_THRESHOLD_RATIO = 0.17;
const SWIPE_CLOSE_THRESHOLD_MIN = 64;
const SWIPE_CLOSE_THRESHOLD_MAX = 132;
const SWIPE_CLOSE_VELOCITY_RATIO = 1.05;
const SWIPE_CLOSE_VELOCITY_MIN = 720;
const SWIPE_CLOSE_VELOCITY_MAX = 1350;
const SWIPE_CLOSE_ANIMATION_DURATION = 120;
const SWIPE_OPEN_ANIMATION_DURATION = 220;
const SWIPE_HIDE_ANIMATION_DURATION = 180;

export function BottomSheet({
  visible,
  enableSwipeDown = true,
  onClose,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const progress = useSharedValue(visible ? 1 : 0);
  const dragY = useSharedValue(0);
  const isClosingBySwipeRef = useRef(false);
  const [renderDrawer, setRenderDrawer] = useState(visible);

  const sheetHeight = useMemo(
    () =>
      Math.min(
        Math.max(SHEET_MIN_HEIGHT, Math.floor(windowHeight * SHEET_MAX_HEIGHT_RATIO)),
        windowHeight - insets.top - SHEET_TOP_GAP,
      ),
    [insets.top, windowHeight],
  );
  const sheetHiddenTranslateY = useMemo(
    () => sheetHeight + SHEET_HIDDEN_EXTRA_OFFSET,
    [sheetHeight],
  );
  const swipeCloseDistance = sheetHiddenTranslateY;
  const swipeCloseThreshold = useMemo(
    () =>
      Math.min(
        SWIPE_CLOSE_THRESHOLD_MAX,
        Math.max(SWIPE_CLOSE_THRESHOLD_MIN, sheetHeight * SWIPE_CLOSE_THRESHOLD_RATIO),
      ),
    [sheetHeight],
  );
  const swipeCloseVelocity = useMemo(
    () =>
      Math.min(
        SWIPE_CLOSE_VELOCITY_MAX,
        Math.max(SWIPE_CLOSE_VELOCITY_MIN, windowHeight * SWIPE_CLOSE_VELOCITY_RATIO),
      ),
    [windowHeight],
  );

  const handleSwipeCloseComplete = useCallback(() => {
    isClosingBySwipeRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      setRenderDrawer(true);
      isClosingBySwipeRef.current = false;
      dragY.value = 0;
      progress.value = 0;
      progress.value = withTiming(1, { duration: SWIPE_OPEN_ANIMATION_DURATION });
      return;
    }

    if (isClosingBySwipeRef.current) {
      isClosingBySwipeRef.current = false;
      setRenderDrawer(false);
      return;
    }

    progress.value = withTiming(0, { duration: SWIPE_HIDE_ANIMATION_DURATION }, (finished) => {
      if (finished) {
        dragY.value = 0;
        runOnJS(setRenderDrawer)(false);
      }
    });
  }, [dragY, progress, visible]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enableSwipeDown)
        .activeOffsetY([-999, 8])
        .failOffsetX([-16, 16])
        .onUpdate((event) => {
          const nextY = Math.min(swipeCloseDistance, Math.max(0, event.translationY));
          dragY.value = nextY;
        })
        .onEnd((event) => {
          const shouldClose =
            dragY.value > swipeCloseThreshold || event.velocityY > swipeCloseVelocity;
          if (shouldClose) {
            dragY.value = withTiming(
              swipeCloseDistance,
              { duration: SWIPE_CLOSE_ANIMATION_DURATION },
              (finished) => {
                if (finished) {
                  runOnJS(handleSwipeCloseComplete)();
                }
              },
            );
            return;
          }

          dragY.value = withSpring(0, { damping: 20, stiffness: 260 });
        })
        .onFinalize(() => {
          if (dragY.value < 0) {
            dragY.value = 0;
          }
        }),
    [
      dragY,
      enableSwipeDown,
      handleSwipeCloseComplete,
      swipeCloseDistance,
      swipeCloseThreshold,
      swipeCloseVelocity,
    ],
  );

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const openTranslateY = interpolate(
      progress.value,
      [0, 1],
      [sheetHiddenTranslateY, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: openTranslateY + dragY.value }],
    };
  }, [dragY, progress, sheetHiddenTranslateY]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const baseOpacity = interpolate(progress.value, [0, 1], [0, 0.35], Extrapolation.CLAMP);
    const dragFactor = interpolate(
      dragY.value,
      [0, swipeCloseDistance],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const opacity = baseOpacity * dragFactor;
    return { opacity };
  }, [dragY, progress, swipeCloseDistance]);

  if (!renderDrawer) {
    return null;
  }

  return (
    <Modal transparent visible={renderDrawer} onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Pressable onPress={onClose} className="absolute inset-0">
            <Animated.View className="flex-1 bg-black" style={backdropAnimatedStyle} />
          </Pressable>

          <GestureDetector gesture={panGesture}>
            <Animated.View
              className="bg-white rounded-t-3xl overflow-hidden"
              style={[{ height: sheetHeight }, sheetAnimatedStyle]}
            >
              <View className="items-center py-2">
                <View className="w-12 h-1.5 rounded-full bg-gray-300" />
              </View>

              <View style={{ flex: 1 }}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
