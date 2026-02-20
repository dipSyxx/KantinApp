import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageLoadEventData } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";

type HeroImageProps = {
  imageUrl?: string | null;
  defaultAspectRatio?: number;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  transition?: number;
};

export function HeroImage({
  imageUrl,
  defaultAspectRatio = 1,
  contentFit = "cover",
  transition = 300,
}: HeroImageProps) {
  const [heroAspectRatio, setHeroAspectRatio] = useState(defaultAspectRatio);

  useEffect(() => {
    setHeroAspectRatio(defaultAspectRatio);
  }, [defaultAspectRatio, imageUrl]);

  if (!imageUrl) {
    return (
      <View
        style={{ width: "100%", aspectRatio: defaultAspectRatio }}
        className="bg-gray-200 items-center justify-center"
      >
        <Ionicons name="image-outline" size={64} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: "100%", aspectRatio: heroAspectRatio }}
      contentFit={contentFit}
      transition={transition}
      onLoad={(event: ImageLoadEventData) => {
        const { width, height } = event.source;
        if (width > 0 && height > 0) {
          setHeroAspectRatio(width / height);
        }
      }}
    />
  );
}
