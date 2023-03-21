import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sendPostRequest = async (
  endpoint: string,
  body: any
): Promise<Response> => {
  try {
    console.log(`POST at: ${API_URL}/${endpoint}`);
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res;
  } catch (e) {
    console.warn(e);
  }
};

const getBikeLocationHistory = async (): Promise<
  Array<{ location: string; time: number }>
> => {
  try {
    const embeddedDeviceId = await AsyncStorage.getItem("@embeddedDeviceId");
    const res = await fetch(`${API_URL}/logs/${embeddedDeviceId}`);

    const data = await res.json();
    return data;
  } catch (e) {
    console.warn(e);
  }
};

export { sendPostRequest, getBikeLocationHistory };
