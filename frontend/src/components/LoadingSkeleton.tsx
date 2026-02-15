import { View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

function SkeletonBlock({ width, height, className }: { width: number | string; height: number; className?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width: width as number, height, opacity, borderRadius: 12 }}
      className={`bg-gray-200 ${className ?? ""}`}
    />
  );
}

export function MenuSkeleton() {
  return (
    <View className="px-4 pt-4">
      {[1, 2, 3].map((day) => (
        <View key={day} className="mb-6">
          <SkeletonBlock width={120} height={24} className="mb-3" />
          {[1, 2].map((item) => (
            <View key={item} className="flex-row items-center mb-3">
              <SkeletonBlock width={64} height={64} />
              <View className="flex-1 ml-3">
                <SkeletonBlock width="80%" height={18} className="mb-2" />
                <SkeletonBlock width="50%" height={14} />
              </View>
              <SkeletonBlock width={60} height={18} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
