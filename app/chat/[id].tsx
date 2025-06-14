import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import Background from "../../components/background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL, BASE_URL2 } from "@env";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams } from "expo-router";

const socket = io(`${BASE_URL2}`, {
  transports: ["websocket"],
});

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [userId, setUserId] = useState("");
  const { receiverId } = useLocalSearchParams();
  const [userRole, setUserRole] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [username, setUsername] = useState("");
  const isSendReady =
    username && userId && receiverId && message.trim() && userRole;
  const flatListRef = useRef<FlatList>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [selectedJadwal, setSelectedJadwal] = useState<string | null>(null);
  const [selectedDokter, setSelectedDokter] = useState<string | null>(null);
  const rawParams = useLocalSearchParams();
  const [hasRated, setHasRated] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const rawUserId = await SecureStore.getItemAsync("userId");
        const token = await SecureStore.getItemAsync("userToken");

        if (!rawUserId || !token) {
          console.warn("Token atau ID tidak ditemukan.");
          router.push("/screens/signin");
          return;
        }

        const cleanedUserId = rawUserId.replace(/"/g, "");
        setUserId(cleanedUserId);

        const response = await axios.get(
          `${BASE_URL}/masyarakat/getbyid/${cleanedUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.nama_masyarakat) {
          setUsername(response.data.nama_masyarakat);
        } else {
          console.warn("Property nama_dokter tidak ada di response");
        }

        if (response.data?.role) {
          setUserRole(response.data.role);
          // console.log("[DEBUG] Set user role:", response.data.role);
        } else {
          console.warn("Property role tidak ada di response");
        }
      } catch (error) {
        console.log("Gagal fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch chat history setelah userId dan receiverId siap
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        if (!userId || !receiverId) {
          console.warn("UserId atau receiverId kosong, skip fetch.");
          return;
        }

        const token = await SecureStore.getItemAsync("userToken");
        const res = await axios.get(
          `${BASE_URL}/chat/history/${userId}/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (error) {
        console.log("Gagal ambil riwayat chat:", error);
      }
    };

    fetchChatHistory();
  }, [userId, receiverId]);

  useEffect(() => {
    // console.log("[DEBUG] Current username:", username);
  }, [username]);

  // ✅ Terima pesan dari socket
  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      console.log("[DEBUG] Received message via socket:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handleIncomingMessage);

    return () => {
      socket.off("chat message", handleIncomingMessage);
    };
  }, []);

  // ✅ Kirim pesan teks

  // console.log("[DEBUG] Messages state after fetch:", messages);
  // console.log("[DEBUG] User ID:", userId);
  // console.log("[DEBUG] Receiver ID:", receiverId);

  useEffect(() => {
    const fetchReceiverName = async () => {
      if (!receiverId) return;
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const res = await axios.get(
          `${BASE_URL}/dokter/getbyid/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.nama_dokter) {
          setReceiverName(res.data.nama_dokter);
          // console.log(
          //   "[DEBUG] receiverName fetched:",
          //   res.data.nama_dokter
          // );
        } else {
          console.log("[DEBUG] receiverName not found in response:", res.data);
        }
      } catch (error) {
        console.log("Gagal fetch nama receiver:", error);
      }
    };

    fetchReceiverName();
  }, [receiverId]);
  // console.log("[DEBUG] Receiver ID:", receiverId);
  // console.log("[DEBUG] Receiver Name:", receiverName);

  // ✅ Kirim gambar dari galeri/kamera
  const sendImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets?.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const imgMsg = {
          sender: username,
          senderId: userId,
          receiverId: receiverId,
          image: base64Image,
          type: "image",
          role: userRole,
          waktu: new Date().toISOString(),
        };

        console.log("[DEBUG] Sending image message:", imgMsg);
        socket.emit("chat message", imgMsg);
      } else {
        console.warn("Pengambilan gambar dibatalkan atau tidak valid.");
      }
    } catch (error) {
      console.log("Gagal mengirim gambar:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      // console.log("[DEBUG] Emitting joinRoom with:", userId);
      socket.emit("joinRoom", userId);
    }
  }, [userId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("[DEBUG] Socket connected ✅");
    });

    socket.on("connect_error", (err) => {
      console.log("[DEBUG] Socket connection error ❌:", err);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // DISBALE CHAT
  useEffect(() => {
    const handleErrorMessage = (error) => {
      // Tampilkan alert atau toast di sini
      alert(error.message); // atau pakai ToastAndroid, Snackbar, dll
    };

    socket.on("errorMessage", handleErrorMessage);

    return () => {
      socket.off("errorMessage", handleErrorMessage);
    };
  }, []);

  const sendMessage = async () => {
    // console.log("[DEBUG] Tombol Kirim ditekan");
    // console.log("username:", username);
    // console.log("userId:", userId);
    // console.log("receiverId:", receiverId);
    // console.log("userRole:", userRole);
    // console.log("message:", message);

    if (message.trim() && username && userId && receiverId) {
      const msgData = {
        text: message,
        sender: username,
        senderId: userId,
        receiverId: receiverId,
        type: "text",
        role: userRole,
        waktu: new Date().toISOString(),
      };

      // console.log("[DEBUG] Sending text message:", msgData);
      // console.log("[DEBUG] Socket connected:", socket.connected);

      socket.emit("chat message", msgData);
      setMessage("");
    } else {
      console.warn("Gagal kirim pesan: Ada data kosong.");
    }
  };

  useEffect(() => {
  const jadwal_id = Array.isArray(rawParams.jadwal_id)
    ? rawParams.jadwal_id[0]
    : rawParams.jadwal_id;

  const status = Array.isArray(rawParams.status)
    ? rawParams.status[0]
    : rawParams.status;

  const dokter_id = Array.isArray(rawParams.dokter_id)
    ? rawParams.dokter_id[0]
    : rawParams.dokter_id;

  console.log("[DEBUG] Rating Check - Parsed Params:", {
    jadwal_id,
    status,
    dokter_id,
    jadwal_id_type: typeof jadwal_id,
    status_type: typeof status,
    dokter_id_type: typeof dokter_id
  });

  const checkRating = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      console.log("[DEBUG] Checking conditions:", {
        jadwal_id_exists: !!jadwal_id,
        jadwal_id_value: jadwal_id,
        status_value: status,
        status_check: status === "selesai",
        status_check_exact: status === 'selesai',
        both_conditions: !!(jadwal_id && status === "selesai")
      });

      if (jadwal_id && status === "selesai") {        
        const response = await axios.get(
          `${BASE_URL}/rating/getbyid/${jadwal_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const hasRated = 
          response.data?.data?.hasRating || 
          response.data?.hasRating || 
          response.data?.rating || 
          (response.data?.data?.rating && response.data.data.rating > 0) ||
          false;

        if (!hasRated) {
          setShowRatingModal(true);
          setSelectedJadwal(jadwal_id);
          setSelectedDokter(dokter_id);
        } else {
          console.log("[DEBUG] ❌ Modal not shown - User already rated");
        }
      } else {
        console.log("[DEBUG] ❌ CONDITIONS NOT MET:", {
          hasJadwalId: !!jadwal_id,
          statusMatch: status === "selesai",
          currentStatus: status
        });
      }
    } catch (error:any) {
      console.error(
        "[DEBUG] ❌ API Error:",
        error.response?.status,
        error.response?.data || error.message
      );
      
      // ✅ Show modal if API error (for testing purposes)
      console.log("[DEBUG] 🚨 API ERROR - Consider showing modal anyway for debug");
      // setShowRatingModal(true); // Uncomment untuk testing jika API error
    }
  };

  // ✅ Tambahkan delay untuk memastikan semua data sudah ready
  const timer = setTimeout(() => {
    checkRating();
  }, 1000);

  return () => clearTimeout(timer);
}, [rawParams]);

// ✅ Fix rating submission
const handleSubmitRating = async () => {
  try {
    const token = await SecureStore.getItemAsync("userToken"); // ✅ Fix: userToken
    
    console.log("[DEBUG] Submitting rating:", {
      jadwal: selectedJadwal,
      dokter_id: selectedDokter,
      rating: ratingValue
    });

    await axios.post(
      `${BASE_URL}/rating/create`,
      {
        jadwal: selectedJadwal,
        dokter_id: selectedDokter,
        rating: ratingValue,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Terima kasih atas rating Anda!");
    setShowRatingModal(false);
    setRatingValue(0); // ✅ Reset rating
  } catch (error:any) {
    console.error(
      "Gagal kirim rating:",
      error.response?.data || error.message
    );
    alert(
      error.response?.data?.message || "Gagal menyimpan rating"
    );
  }
};

  // TANPA NAMA
  const renderItem = ({ item }) => {
    const isSender = item.senderId === userId;

    return (
      <View
        className={`rounded-[3rem] p-4 px-4 my-1 max-w-[80%] ${
          isSender ? "bg-skyDark self-end" : "bg-[#C3E9FF] self-start"
        }`}
      >
        {/* Kalau pengirim adalah kamu, tampilkan "Saya" */}
        {/* {isSender && <Text className="font-bold text-white">Saya</Text>} */}

        {item.type === "image" && item.image ? (
          <TouchableOpacity onPress={() => setPreviewImage(item.image)}>
            <Image
              source={{ uri: item.image }}
              className="w-24 h-32 mt-1 rounded-md"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <Text className={`${isSender ? "text-white" : "text-black"}`}>
            {item.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Background>
      <View style={{ flex: 1 }}>
        {/* Header - Tambahkan timer */}
        <View className="flex-row justify-between items-center w-full px-5 bg-skyLight py-5 pt-10">
          <View className="flex-row items-center w-10/12">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#025F96" />
            </TouchableOpacity>
            <Text
              className="w-11/12 truncate text-skyDark font-bold text-xl ml-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {receiverName ? receiverName : "Loading..."}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Image
              className="h-10 w-12"
              source={require("../../assets/images/logo.png")}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Chat Area */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Chat Messages */}
              <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
                keyboardShouldPersistTaps="handled"
                inverted={true}
                className="px-4 flex-1"
              />

              {/* Chat Input */}
              <View className="px-4 bg-skyDark py-4">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => sendImage(false)}>
                    <Ionicons name="image-outline" size={28} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => sendImage(true)}
                    className="ml-2"
                  >
                    <Ionicons name="camera-outline" size={28} color="gray" />
                  </TouchableOpacity>
                  <View className="flex-1 ml-2 mr-2">
                    <TextInput
                      className="border border-gray-400 bg-[#C3E9FF] rounded-3xl p-2"
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Tulis pesan..."
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={sendMessage}
                    className="bg-blue-500 px-4 py-2 rounded-lg mr-1"
                  >
                    <Text className="text-white font-semibold">Kirim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* Preview Modal */}
        <Modal visible={!!previewImage} transparent={true} animationType="fade">
          <View className="flex-1 bg-black bg-opacity-80 justify-center items-center">
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="absolute top-10 right-4 z-10"
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                className="w-[90%] h-[60%] rounded-lg"
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        <Modal visible={showRatingModal} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-Warm rounded-2xl p-5 w-4/5">
              <Text className="text-lg text-skyDark font-bold mb-2.5">
                Beri Rating Konsultasi
              </Text>
              <View className="flex-row justify-center my-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRatingValue(star)}
                  >
                    <MaterialIcons
                      name={star <= ratingValue ? "star" : "star-border"}
                      size={32}
                      color={star <= ratingValue ? "#facc15" : "#9ca3af"}
                      style={{ marginHorizontal: 5 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                className="bg-skyDark p-2.5 rounded-[10px] items-center mt-2.5"
                onPress={handleSubmitRating}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Background>
  );
}
