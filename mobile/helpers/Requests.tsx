import { API_URL } from "@env";

const sendPostRequest = async (endpoint: string, body: any): Promise<Response> => {
  try {
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

export { sendPostRequest };
