import React from "react";
import { View, TouchableOpacity, Text, StatusBar } from "react-native";
import Modal from "react-native-modal";

interface ModalTemplateProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropColor="black"
      backdropOpacity={0.5}
      style={{ margin: 0, justifyContent: "center" }}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={500}
      animationOutTiming={500}
      useNativeDriver
    >
      {isVisible && (
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" translucent={false} />
      )}
      <View className="bg-white p-4 rounded-xl mx-5 relative">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-2 right-4 z-10"
        >
          {/* <Text className="text-2xl text-gray-700">×</Text> */}
        </TouchableOpacity>
        {children}
      </View>
    </Modal>
  );
};

export default ModalTemplate;
