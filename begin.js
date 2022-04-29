let mediaRecorder;
let recordedBlobs;

const errorMsgElement = document.querySelector("span#errorMsg");
const recordedVideo = document.querySelector("video#recorded");
const recordButton = document.querySelector("button#record");
const playButton = document.querySelector("button#play");
const downloadButton = document.querySelector("button#download");
const analyzeButton = document.querySelector("button#analyze");
const videoFileInput = document.querySelector("input#video");
const gesture = document.querySelector("h3#gesture");

analyzeButton.addEventListener("click", () => {
  var video = videoFileInput.files[0];

  var videoData = new FormData();
  videoData.append("video", video);
  fetch("http://localhost:5000/upload-video", {
    method: "POST",
    body: videoData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      gesture.innerHTML = "Gesture: " + data.gesture;
      var r = Math.floor(Math.random() * 4) + 1;
      window.location.href = "result" + r + ".html";
    })
    .catch((err) => console.log("Error: ", err));
  console.log(video);
});

recordButton.addEventListener("click", () => {
  if (recordButton.textContent === "Record") {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = "Record";
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
});

playButton.addEventListener("click", () => {
  console.log("URL", "sucks");
  const superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

downloadButton.addEventListener("click", () => {
  const blob = new Blob(recordedBlobs, { type: "video/mp4" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "test.mp4";
  document.body.appendChild(a);
  a.click();

  console.log(a);
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  let options = { mimeType: "video/webm;codecs=vp9,opus" };
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error("Exception while creating MediaRecorder:", e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(
      e
    )}`;
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  recordButton.textContent = "Stop Recording";
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log("Recorder stopped: ", event);
    console.log("Recorded Blobs: ", recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log("MediaRecorder started", mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log("getUserMedia() got stream:", stream);
  window.stream = stream;

  const gumVideo = document.querySelector("video#gum");
  gumVideo.srcObject = stream;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error("navigator.getUserMedia error:", e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

document.querySelector("button#start").addEventListener("click", async () => {
  const hasEchoCancellation =
    document.querySelector("#echoCancellation").checked;
  const constraints = {
    audio: {
      echoCancellation: { exact: hasEchoCancellation },
    },
    video: {
      width: 1280,
      height: 720,
    },
  };
  console.log("Using media constraints:", constraints);
  await init(constraints);
});



