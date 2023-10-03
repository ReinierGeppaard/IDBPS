import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { auth, storage } from "./firebase";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";
import { drawKeypoints, drawSkeleton } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const checkUserAuth = () => {
      auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });
    };

    checkUserAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      const email = "reinier.geppaard@hotmail.com";
      const password = "IDBPS1";

      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPoseNet = async () => {
      const net = await posenet.load();

      const detect = async () => {
        if (!isMounted) return;

        if (
          webcamRef.current &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video;

          const input = tf.browser.fromPixels(video);
          const pose = await net.estimateSinglePose(input);

          input.dispose();

          if (isMounted) {
            const ctx = canvasRef.current.getContext("2d");

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

            drawKeypoints(pose.keypoints, 0.6, ctx);
            drawSkeleton(pose.keypoints, 0.6, ctx);
          }
        }
      };

      const intervalId = setInterval(detect, 100);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    };

    loadPoseNet();
  }, []);

  const captureAndSaveImage = async () => {
    if (!user) {
      console.error("User is null. Please make sure the user is signed in.");
      return;
    }

    if (canvasRef.current) {
      const imageUrl = canvasRef.current.toDataURL("image/jpeg");

      const storageRef = ref(storage, `images/${user.uid}-${Date.now()}.jpg`);

      try {
        await uploadString(storageRef, imageUrl, "data_url");
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Image uploaded to Firebase Storage");
        setCapturedImage(downloadUrl);
      } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="camera-container">
          <div className="camera">
            <Webcam
              ref={webcamRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 0,
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 0,
                width: 640,
                height: 480,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              {user ? (
                <React.Fragment>
                  <p>Welcome, {user.email}!</p>
                  <button onClick={captureAndSaveImage} style={{ zIndex: 1 }}>
                    Capture and Save Photo
                  </button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <p>Sign in to capture a photo:</p>
                  <button onClick={handleSignIn} style={{ zIndex: 1 }}>
                    Sign In
                  </button>
                </React.Fragment>
              )}
            </div>
          </div>
          {capturedImage && (
            <div className="captured-image">
              <img
                src={capturedImage}
                alt="Captured"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
