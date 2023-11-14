import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const VoiceCall = () => {
  const [options, setOptions] = useState({
    appId: "e2bcf842d1f345088f6417f3ee2c1b0d",
    channel: "test",
    token:
      "007eJxTYFhx+8bazc/NV26//ljkQkjN7GXOC15suzS76aCep6ONCdMuBYZUo6TkNAsToxTDNGMTUwMLizQzE0PzNOPUVKNkwySDlKnKQakNgYwMNvrmTIwMEAjiszCUpBaXMDAAABpsIKs=",
    uid: 0,
  });

  const [channelParameters, setChannelParameters] = useState({
    localAudioTrack: null,
    remoteAudioTrack: null,
    remoteUid: null,
    isMuteAudio: false,
  });

  useEffect(() => {
    const showMessage = (text) => {
      document.getElementById("message").textContent = text;
    };

    const startBasicCall = async () => {
      const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });

      agoraEngine.on("user-published", async (user, mediaType) => {
        await agoraEngine.subscribe(user, mediaType);

        if (mediaType === "audio") {
          console.log("hello");
          setChannelParameters((prevParams) => ({
            ...prevParams,
            remoteUid: user.uid,
            remoteAudioTrack: user.audioTrack,
          }));

          // Check the readyState of the remote audio track before attempting to play.
          if (user.audioTrack) {
            user.audioTrack.play();
            console.warn(`Remote user connected: ${user.uid}`);
          } else {
            console.warn(
              "Remote audio track is not live yet. Subscription might be pending."
            );
          }
        }
      });

      agoraEngine.on("user-unpublished", (user) => {
        // showMessage(`Remote user ${user.uid} has left the channel`);
      });

      document.getElementById("join").onclick = async function () {
        try {
          await agoraEngine.join(
            options.appId,
            options.channel,
            options.token,
            options.uid
          );
          showMessage(`Joined channel: ${options.channel}`);

          const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          setChannelParameters((prevParams) => ({
            ...prevParams,
            localAudioTrack,
          }));

          //   console.log(
          //     "Local Audio Track Status:",
          //     localAudioTrack.getMediaStreamTrack().readyState
          //   );

          await agoraEngine.publish(localAudioTrack);
        } catch (error) {
          //   console.error("Error during join:", error);
        }
      };

      document.getElementById("leave").onclick = async function () {
        try {
          if (channelParameters.localAudioTrack !== null) {
            channelParameters.localAudioTrack.close();
          } else {
            console.error("Local audio track is null.");
          }

          await agoraEngine.leave();
          //   showMessage("You left the channel");
          window.location.reload();
        } catch (error) {
          //   console.error("Error during leave:", error);
        }
      };
    };

    startBasicCall();
  }, [channelParameters.localAudioTrack, options]);

  const handleLocalAudioVolumeChange = (evt) => {
    const volumeValue = parseInt(evt.target.value);
    // console.log(`Volume of local audio: ${volumeValue}`);
    channelParameters.localAudioTrack.setVolume(volumeValue);
  };

  const handleRemoteAudioVolumeChange = (evt) => {
    const volumeValue = parseInt(evt.target.value);
    // Adjust the volume of remote audio only if local audio is not muted.
    if (!channelParameters.isMuteAudio) {
      channelParameters.remoteAudioTrack.setVolume(volumeValue);
    }
  };

  const handleMuteAudio = async () => {
    if (channelParameters.isMuteAudio === false) {
      // Mute the local audio.
      channelParameters.localAudioTrack.setEnabled(false);
      // Update the button text.
      document.getElementById("muteAudio").innerHTML = "Unmute Audio";
      setChannelParameters((prevParams) => ({
        ...prevParams,
        isMuteAudio: true,
      }));
    } else {
      // Unmute the local audio.
      channelParameters.localAudioTrack.setEnabled(true);
      // Update the button text.
      document.getElementById("muteAudio").innerHTML = "Mute Audio";
      setChannelParameters((prevParams) => ({
        ...prevParams,
        isMuteAudio: false,
      }));
    }
  };

  return (
    <div>
      <h2>Get started with Voice Calling</h2>
      <div>
        <button type="button" id="join">
          Join
        </button>
        <button type="button" id="leave">
          Leave
        </button>
      </div>
      <br />
      <div id="message"></div>

      <button type="button" id="muteAudio" onClick={handleMuteAudio}>
        {channelParameters.isMuteAudio ? "Unmute Audio" : "Mute Audio"}
      </button>
      <hr />
      <label> Local Audio Level :</label>
      <input
        type="range"
        min="0"
        id="localAudioVolume"
        max="100"
        step="1"
        onChange={handleLocalAudioVolumeChange}
      />
      <label> Remote Audio Level :</label>
      <input
        type="range"
        min="0"
        id="remoteAudioVolume"
        max="100"
        step="1"
        onChange={handleRemoteAudioVolumeChange}
      />
    </div>
  );
};

export default VoiceCall;
