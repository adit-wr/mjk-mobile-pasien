import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Background from "../../../components/background";
import { images } from "../../../constants/images";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CancelIcon from "../../../assets/icons/cancel.svg";
import AccIcon from "../../../assets/icons/ctg.svg";
import WaitIcon from "../../../assets/icons/wait.svg";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const getDayName = (dateString: string) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const date = new Date(dateString);
  return days[date.getDay()];
};

export default function Jadwal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        if (!userId) return;

        const res = await axios.get("https://mjk-backend-production.up.railway.app/api/jadwal/getall");

        const filtered = res.data.filter((j: any) => {
          return j.masyarakat_id && j.masyarakat_id._id === userId;
        });

        setJadwalList(filtered);
      } catch (err: any) {
        console.error("Gagal fetch jadwal:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  return (
    <Background>
      <View>
        <View className="flex flex-row justify-between items-center w-full px-5 py-5 pt-8">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text className="text-skyDark font-bold text-xl pl-2">Jadwal</Text>
          </View>
          <Image
            className="h-10 w-12"
            source={images.logo}
            resizeMode="contain"
          />
        </View>

        {/* animasi loading */}
        {loading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#025F96" />
            <Text className="mt-2 text-skyDark font-semibold">Memuat jadwal...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: insets.bottom + 120,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-6 w-4/5">
              {jadwalList.length === 0 ? (
                <Text className="text-center text-gray-500 text-base">Belum ada jadwal konsultasi.</Text>
              ) : (
                jadwalList.map((jadwal, index) => (
                  <View
                    key={index}
                    className="bg-white w-full h-40 rounded-3xl flex-col justify-center shadow-md"
                  >
                    <View className="flex-row">
                      <View className="px-4">
                        <Image
                          source={images.foto}
                          className="h-16 w-16 rounded-full border border-gray-300"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="w-3/4">
                        <Text className="font-bold text-base text-skyDark pb-1">
                          {jadwal.dokter_id?.nama_dokter || "Nama Dokter"}
                        </Text>
                        <View className="h-[2px] bg-skyDark w-11/12" />
                        <View className="flex-row pt-1 items-center">
                          <FontAwesome name="star" size={20} color="#025F96" />
                          <Text className="font-bold text-base text-skyDark pl-1">{jadwal.dokter_id?.rating_dokter}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row justify-between px-4">
                      <View className="flex-col pt-1">
                        <Text className="font-bold text-sm text-skyDark">
                          {getDayName(jadwal.tgl_konsul)},
                        </Text>
                        <Text className="font-bold text-sm text-skyDark">
                          {new Date(jadwal.tgl_konsul).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Text>
                        <Text className="font-bold text-sm text-skyDark">
                          Pukul {jadwal.jam_konsul}
                        </Text>
                      </View>
                      <View className="justify-center w-1/3 flex-col">
                        <View
                          className={`p-2 flex-row gap-2 rounded-xl items-center justify-between ${
                            jadwal.status_konsul === "diterima"
                              ? "bg-green-600"
                              : jadwal.status_konsul === "ditolak"
                              ? "bg-red-600"
                              : "bg-skyDark"
                          }`}
                        >
                          {jadwal.status_konsul === "menunggu" && <WaitIcon width={18} height={18} />}
                          {jadwal.status_konsul === "diterima" && <AccIcon width={18} height={18} />}
                          {jadwal.status_konsul === "ditolak" && <CancelIcon width={18} height={18} />}
                          <View className="w-3/4 justify-center items-center">
                            <Text className="text-white font-bold text-sm capitalize">
                              {jadwal.status_konsul}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Background>
  );
}
