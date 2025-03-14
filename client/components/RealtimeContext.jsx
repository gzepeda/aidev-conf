// RealtimeContext.js
import React, { createContext, useContext, useState, useRef } from "react";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [functionCalls, setFunctionCalls] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const dataChannel = useRef(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const mediaStream = useRef(null);
  const transcript = useRef("");
  async function startSession() {
    setEvents([]);

    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a peer connection
    peerConnection.current = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    peerConnection.current.ontrack = (e) =>
      (audioElement.current.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    mediaStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    peerConnection.current.addTrack(mediaStream.current.getTracks()[0]);

    // Set up data channel for sending and receiving events
    dataChannel.current =
      peerConnection.current.createDataChannel("oai-events");
    dataChannel.current.addEventListener("message", (e) => {
      const message = JSON.parse(e.data);

      // Aggregate all events into a single array
      setEvents((prev) => [message, ...prev]);

      // If this event is a tool call, add it to the tool call array
      if (
        message.type === "response.done" &&
        message.response.output.length > 0 &&
        message.response.output[0].type === "function_call"
      ) {
        setFunctionCalls((prev) => [message, ...prev]);
      }

      // Use transcript delta events to implement guardrails
      if (message.type === "response.audio_transcript.delta") {
        transcript.current += message.delta;
        responseGuardrails(transcript.current);
      }

      // Use transcript delta events to implement guardrails
      if (message.type === "response.audio_transcript.done") {
        transcript.current = "";
      }
    });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await peerConnection.current.setRemoteDescription(answer);

    setIsSessionActive(true);

    // TODO - uncomment this to have the model start talking immediately
    /* 
    setTimeout(() => {
      sendClientEvent({ type: "response.create" });
    }, 500);
    */
  }

  // Toggle mute on the local audio track
  function toggleMute(isActive) {
    mediaStream.current.getAudioTracks().forEach((track) => {
      track.enabled = isActive;
    });
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel.current) {
      dataChannel.current.close();
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    dataChannel.current = null;
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel.current) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.current.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Examine transcription text deltas and moderate them
  function responseGuardrails(text) {
    console.log(text);
    // TODO - Placeholder for guardrails
  }

  const contextValue = {
    events,
    functionCalls,
    isSessionActive,
    toggleMute,
    startSession,
    stopSession,
    sendClientEvent,
    sendTextMessage,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
