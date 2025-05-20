import { useState, useEffect } from "react";
import SplashScreen from "./splashscreen";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@env";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleStartup = async () => {
      const token = await SecureStore.getItemAsync("userToken");

      if (token) {
        try {
          await axios.get(
            `${BASE_URL}/auth/login_masyarakat`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // delay 2 detik, lalu masuk home
          setTimeout(() => {
            setIsLoading(false);
            router.replace("/(tabs)/home");
          }, 2000);
        } catch (error) {
          await SecureStore.deleteItemAsync("userToken");
          setTimeout(() => {
            setIsLoading(false);
            router.replace("/screens/signin");
          }, 2000);
        }
      } else {
        setTimeout(() => {
          setIsLoading(false);
          router.replace("/screens/signin");
        }, 2000);
      }
    };

    handleStartup();
  }, []);

  return <>{isLoading ? <SplashScreen /> : null}</>;
}
