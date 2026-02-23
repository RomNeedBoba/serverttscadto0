const axios = require("axios");

const PYTHON_TTS_URL = process.env.PYTHON_TTS_URL || "https://8080-01kj47mby9s29qcqcqek4c2x6e.cloudspaces.litng.ai";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 120000);

const client = axios.create({
  baseURL: PYTHON_TTS_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

exports.callPythonSynthesize = async ({ text }) => {
  try {
    const startTime = Date.now();

    // 1. Add responseType: "arraybuffer" so Axios knows we are downloading a binary file!
    const resp = await client.post("/synthesize", { text }, {
      responseType: "arraybuffer" 
    });

    // 2. Convert the binary ArrayBuffer to a Base64 string
    const base64Audio = Buffer.from(resp.data).toString("base64");
    const audioDataUri = `data:audio/wav;base64,${base64Audio}`;

    const elapsedMs = Date.now() - startTime;

    // 3. Return the exact JSON structure your Controller expects
    return {
      stage1_raw: text,
      stage2_normalized: text, 
      stage3_pronunciation: text, 
      stage4_audio_url: audioDataUri, // <-- The Base64 string goes here!
      stage4_waveform: [0], // Default fallback
      meta: {
        sample_rate: 22050,
        device: "cpu",
        elapsed_ms: elapsedMs,
      }
    };

  } catch (err) {
    // Normalize Axios errors for your Express middleware
    const status = err.response?.status || 502;
    
    // Because we set responseType to arraybuffer, error data might also be a buffer!
    // We need to decode it back to a string so we can actually read the error.
    let detail = err.response?.data || err.message || "Failed calling Python TTS service";
    if (Buffer.isBuffer(detail)) {
      detail = detail.toString("utf8");
    }

    const e = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    e.status = status;
    e.detail = detail;
    throw e;
  }
};