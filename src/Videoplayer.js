import React from 'react';

const VideoPlayer = () => {
  return (
    <div>
      <h1>Video Player</h1>
      <video controls style={{ width: '900px', height: '900px' }}>
        <source src="/assets/archiflow_demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
