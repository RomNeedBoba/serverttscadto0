const { callPythonSynthesize } = require("../services/pythonService");

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

exports.synthesizeTts = async (req, res, next) => {
  try {
    const { text } = req.body || {};

    if (!isNonEmptyString(text)) {
      return res.status(400).json({
        error: "Invalid request body. Expected { text: string } with non-empty text.",
      });
    }

    // Optional: enforce max length to protect TTS + GPU memory
    if (text.length > 500) {
      return res.status(413).json({
        error: "Text too long. Please limit to 500 characters.",
      });
    }

    const result = await callPythonSynthesize({ text });

    // Enforce exact response contract required by you
    const payload = {
      stage1_raw: result.stage1_raw,
      stage2_normalized: result.stage2_normalized,
      stage3_pronunciation: result.stage3_pronunciation,
      stage4_audio_url: result.stage4_audio_url,
      stage4_waveform: result.stage4_waveform, // extra: waveform array for visualization
      meta: result.meta || {},                  // optional: durations, sample_rate, etc.
    };

    return res.json(payload);
  } catch (err) {
    next(err);
  }
};
