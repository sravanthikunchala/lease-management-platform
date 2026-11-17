import React, { useRef, useState, useEffect } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import "./SelfieCapture.css";

const SelfieCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [model, setModel] = useState(null);
  const [instruction, setInstruction] = useState("Click Start Camera");

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    const loadedModel = await blazeface.load();
    setModel(loadedModel);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setInstruction("Align your face and click Capture");
      }
    } catch (err) {
      alert("Unable to access the camera. Please check permissions.");
      console.error(err);
    }
  };

  const captureSelfie = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !model) {
      alert("Video or model not ready");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const input = tf.browser.fromPixels(canvas);
    const predictions = await model.estimateFaces(input, false);
    input.dispose();

    if (predictions.length === 0) {
      alert("No face detected. Please try again.");
      return;
    }

    const face = predictions[0];
    const [x, y] = face.topLeft;
    const [x2, y2] = face.bottomRight;
    const buffer = 40;

    const cropX = Math.max(x - buffer, 0);
    const cropY = Math.max(y - buffer, 0);
    const cropW = Math.min(x2 - x + buffer * 2, canvas.width - cropX);
    const cropH = Math.min(y2 - y + buffer * 2, canvas.height - cropY);

    const croppedImage = ctx.getImageData(cropX, cropY, cropW, cropH);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(croppedImage, 0, 0);

    // Resize to passport size (413x531) on white background
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = 413;
    finalCanvas.height = 531;
    const finalCtx = finalCanvas.getContext("2d");

    finalCtx.fillStyle = "white";
    finalCtx.fillRect(0, 0, 413, 531);

    const scale = Math.min(413 / cropW, 531 / cropH);
    const scaledW = cropW * scale;
    const scaledH = cropH * scale;
    const dx = (413 - scaledW) / 2;
    const dy = (531 - scaledH) / 2;
    finalCtx.drawImage(tempCanvas, dx, dy, scaledW, scaledH);

    const passportImage = finalCanvas.toDataURL("image/png");
    setSelfieImage(passportImage);
    onCapture && onCapture(passportImage);

    const stream = video.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };

  const retake = () => {
    setSelfieImage(null);
    setInstruction("Click Start Camera");
    startCamera();
  };

  return (
    <div className="selfie-capture-container">
      <label className="kyc-label">Take a Selfie</label>

      {!selfieImage ? (
        <>
          <div className="selfie-video-wrapper">
            <video ref={videoRef} autoPlay playsInline className="selfie-video" />
            <canvas ref={overlayRef} className="overlay-canvas" />
          </div>

          <div className="selfie-instructions">
            <p>{instruction}</p>
          </div>

          <div className="selfie-buttons">
            <button className="primary-button selfie-btn" onClick={startCamera}>
              Start Camera
            </button>
            <button className="primary-button selfie-btn" onClick={captureSelfie}>
              Capture Selfie
            </button>
          </div>
        </>
      ) : (
        <>
          <img src={selfieImage} alt="Selfie" className="selfie-preview" />
          <div>
            <button className="primary-button selfie-btn" onClick={retake}>
              Retake Selfie
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default SelfieCapture;
