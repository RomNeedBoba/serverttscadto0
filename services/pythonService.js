const axios = require("axios");

const PYTHON_TTS_URL = process.env.PYTHON_TTS_URL || "https://8080-01kj47mby9s29qcqcqek4c2x6e.cloudspaces.litng.ai";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 120000);

const client = axios.create({
  baseURL: PYTHON_TTS_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

exports.callPythonSynthesize = async ({ text }) => {
  try {
    const resp = await client.post("/synthesize", { text });
    const data = resp.data;

    // Attach the Python server's URL if it's missing
    if (data.stage4_audio_url && !data.stage4_audio_url.startsWith("http")) {
      const path = data.stage4_audio_url.startsWith("/") 
        ? data.stage4_audio_url 
        : `/${data.stage4_audio_url}`;
        
      data.stage4_audio_url = `${PYTHON_TTS_URL}${path}`;
    }

    return data;
  } catch (err) {
    const status = err.response?.status || 502;
    const detail = err.response?.data || err.message || "Failed calling Python TTS service";
    const e = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    e.status = status;
    e.detail = detail;
    throw e;
  }
};