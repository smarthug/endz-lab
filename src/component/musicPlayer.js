import React, {  useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import VolumeOff from "@mui/icons-material/VolumeOff";
import VolumeUp from "@mui/icons-material/VolumeUp";

import Youtube from "react-youtube";

export default function MusicPlayer({ videoId }) {
    const videoRef = useRef();
    const [isSound, setSound] = useState(false);

    function toggleMusic() {

        isSound ? videoRef.current.pauseVideo() : videoRef.current.playVideo()
        setSound(!isSound);
    }

    function onReady(event) {
        videoRef.current = event.target;
    }

    return (
        <div>
            <IconButton
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 999,
                }}
                onClick={toggleMusic}
            >
                {isSound ? (
                    <VolumeOff color="primary" fontSize="large" />
                ) : (
                    <VolumeUp color="primary" fontSize="large" />
                )}
            </IconButton>
            <div
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    zIndex: -999,
                }}
            >
                <Youtube
                    videoId={videoId}
                    opts={{
                        width: "10",
                        height: "10",
                        playerVars: {
                            //   autoplay: 1,
                        },
                    }}
                    onReady={onReady}
                />
            </div>
        </div>
    );
}

