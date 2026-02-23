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
    return resp.data;
  } catch (err) {
    // Normalize Axios errors for your Express middleware
    const status = err.response?.status || 502;
    const detail =
      err.response?.data ||
      err.message ||
      "Failed calling Python TTS service";

    const e = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    e.status = status;
    e.detail = detail;
    throw e;
  }
};
