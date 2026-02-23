const axios = require("axios");

const PYTHON_TTS_URL = process.env.PYTHON_TTS_URL || "https://8080-01kj47mby9s29qcqcqek4c2x6e.cloudspaces.litng.ai";

const client = axios.create({
  baseURL: PYTHON_TTS_URL,
  timeout: 120000,
});

exports.callPythonSynthesize = async ({ text }) => {
  try {
    const resp = await client.post("/synthesize", { text });
    const data = resp.data;

    // Double-check: If Python still sends a relative path, fix it here
    if (data.stage4_audio_url && !data.stage4_audio_url.startsWith("http")) {
        const path = data.stage4_audio_url.startsWith("/") ? data.stage4_audio_url : `/${data.stage4_audio_url}`;
        data.stage4_audio_url = `${PYTHON_TTS_URL}${path}`;
    }

    return data;
  } catch (err) {
    const status = err.response?.status || 502;
    const detail = err.response?.data || err.message;
    const e = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    e.status = status;
    throw e;
  }
};