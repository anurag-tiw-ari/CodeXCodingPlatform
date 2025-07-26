import React from "react";

function Editorial({secureURL})

    {
         return (
            <div>
                <div>
                    <video src={secureURL} controls autoplay muted></video>
                </div>
            </div>
         )
    }

export default Editorial;