import React, { Suspense, useRef } from 'react';

import Modal from 'react-bootstrap/Modal'; // You need to import the Bootstrap Modal component
import { useState } from 'react';
import './App.css';
import ModelViewer from './ModelViewer';
import axios from 'axios';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import VideoPlayer from './Videoplayer';





function App() {
  // const modelViewerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Tab 1');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showModelViewer, setShowModelViewer] = useState(true);
  const [modelUrl, setModelUrl] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleFormSubmit = async (event) => {
    if (prompt.trim() !== '') {
      try {
        console.log('api hitt')
        const filename = "table";
        const seed = 1;
        const guidance = 16;
        const steps = 64;

        const response = await axios.get(`http://localhost:8000/get_model/${prompt}`, {
          params: {
            filename: filename,
            seed: seed,
            guidance: guidance,
            steps: steps,

          },
        },
        { responseType: 'arraybuffer' }
        );


        const contentType = response.headers['content-type'];

        if (contentType === 'application/json') {
          // Handle JSON response
          console.log('Received JSON response:', response.data);
          if (response.data && response.data.modelUrl) {
            setModelUrl(response.data.modelUrl);
          } else {
            console.error('Invalid JSON response:', response.data);
            // Handle the case where the JSON response doesn't contain the expected data
          }
        } else if (contentType === 'application/octet-stream') {
          // Handle binary response

          console.log('Received binary response:', response);
        //   const loader = new GLTFLoader();
        //   const data = new Uint8Array(response.data);
        //   loader.parse(data.buffer, '', (gltf) s=> {
        //   setModelLoaded(gltf.scene);
        //   console.log(modelLoaded,"modelloaded")
        // });

          // Create a Blob from the response data
          const blob = new Blob([response.data], { type: contentType });

          // Create a URL for the Blob
          const blobUrl = URL.createObjectURL(blob);

          // Set the URL to your state if needed
          setModelUrl(blobUrl);

          // Create a link element and simulate a click to download the file
          const link = document.createElement('a');
          link.href = blobUrl;

          // Clean up the URL and the link element
          URL.revokeObjectURL(blobUrl);

          console.log('.glb file downloaded successfully');

        } else {
          console.warn('Received response with unexpected content type:', contentType);
          // Handle other types if necessary
        }
      } catch (error) {
        console.error('An error occurred:', error);

        // If the error has a response property, log it
        if (error.response) {
          console.error('Response:', error.response);
        }

        // Handle the error here
      }
      setMessages([...messages, { text: prompt, sender: 'user' }]);
      setPrompt('');
      setShowModelViewer(!showModelViewer);
      setShowChat(true);
    }
    event.preventDefault();
  };
  const ref = useRef()

  return (
    <div className="body">
      <nav className="navbar">
        <div className="container w-container">
          <div className="nav-md-wrap">
            <div className="hamburger">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
            <div className="nav-logo-md">
              <image src={require("./img/favicon-16x16.png")} loading="lazy" alt="ArchiFlow AI" style={{
                height: "25px"
              }} />
            </div>
          </div>
          <div className="nav-wrap">
            <div className="nav-logo">
              <a href="index.html">

              </a>
              <image src={require("./img/favicon-16x16.png")} loading="lazy" alt="Archi AI" style={{
                height: "25px", width: "25px", backgroundColor: "red"
              }} />
            </div>
            <div className="nav-menu">
              <a href="#" className="nav-link">Home</a>
              <a href="#hiw" className="nav-link">How it Works</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </div>
            <div className="wrap-nav-btn">
              <button className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal" data-bs-target="#registerModal">

              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="section bg-dot wf-section hero-section">
        <div className="container w-container">
          <div className="wrap-text hero-text">
            <span className="text-gradient">Smart &amp; Instant Design Tool</span>
            <h1 className="head-title">Design Your Interior & Exterior With AI</h1>
            <div className="head-subtitle">Experience the Future: Instantly Generate 3D Models from Text with Our Revolutionary AI-Powered Design Tool.<br />Professionals and individuals can now create unlimited renders of any space.</div>
            <div className="start-here">

              <span>No credit card required</span>
            </div>
          </div>
        </div>
        <div className="before-after">
          <div>
            <h4>Original Room</h4>
            <img src={require("./img/original-room.jpg")} alt="Original photo of a room" width="450" loading="lazy" />
          </div>
          <div>
            <h4>Interior Design Generated By AI</h4>
            <img src={require("./img/ai-room.jpg")} alt="Interior design generated by ArchiFlow" width="450" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="section wf-section" id="hiw">
        <div className="container w-container">
          <div className="wrap-text">
            <div className="over-hide">
              <h2 className="main-title">How Does It Work?</h2>
            </div>
            <div className="over-hide _w-70">
              <div className="main-subtitle">Craft 3D Models with Ease: Create Stunning Designs Using Text in Single Simple Steps</div>
            </div>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                name="email"
                id="signinEmail"
                placeholder="Enter a Prompt..."
                aria-label="Enter a Prompt..."
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

            </div>
            <button
              className="outer-nav-btn w-inline-block"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#registerModal"
              onClick={handleFormSubmit}
            >
              <div className="inner-nav-btn">
                <div className="nav-btn-text">Process</div>
                <div className="w-embed">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302"
                      stroke="url(#paint0_linear_1_240)"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.49219 13.5076L13.4176 4.58214"
                      stroke="url(#paint1_linear_1_240)"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9ED4FC" />
                        <stop offset="1" stopColor="#D081F7" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9ED4FC" />
                        <stop offset="1" stopColor="#D081F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </button>
          </form>




          {showModelViewer && (
            <div className="section wf-section">
              <div className="container w-container" style={{border: "1px solid white", borderRadius: "15px", background: "Black",width: '1000px', height: '1000px' }}>
                {/* {modelUrl && <ModelViewer/>} */}
                <VideoPlayer />

              </div>
            </div>
          )}

          <div className="section wf-section">
            <div className="container w-container">
              {showChat && ( // Show chat box if showChat is true
                <div className="chat-box">
                  {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                      {message.text}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>


        </div>
      </div>

      <div className="section wf-section" id="features">
        <div className="container w-container">
          <div className="wrap-text">


          </div>
          <div className="mt-5">
            <div data-w-id="32d6f446-0d72-ca80-bdca-df82f5c57f32" style={{ opacity: 10 }} data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">

              <div className="w-tab-content">
                <div data-w-tab="Tab 1" className={`tab-panel w-tab-pane ${activeTab === 'Tab 1' ? 'w--tab-active' : ''}`}>
                  <div className="wrap-tab-content">
                    <div id="w-node-d02a08b5-e077-9f2d-3574-a52026df753a-2cc6d822" className="wrao-tab-content-text">
                      <h3 id="w-node-e33fff02-5075-e46d-cd78-bced39abb9c2-2cc6d822" className="tab-content-title">Living Room</h3>
                      <div id="w-node-_19fb8305-c4fb-d49b-a05a-9551ca6dac92-2cc6d822" className="tab-content-subtitle">
                        This innovative tool takes into account your personal preferences and creates a customised living room
                        just for you. You simply need to answer a few questions about what you're looking for, and AI will do the rest.
                        Whether you're after a cosy space or a stylish showpiece for entertaining, our AI-powered tool will create a custom living room design.
                      </div>
                      <a href="#" className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal" data-bs-target="#registerModal">
                        <div className="inner-nav-btn">

                          <div className="w-embed">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302" stroke="url(#paint0_linear_1_240)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M4.49219 13.5076L13.4176 4.58214" stroke="url(#paint1_linear_1_240)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                              <defs>
                                <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#9ED4FC" />
                                  <stop offset="1" stopColor="#D081F7" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#9ED4FC" />
                                  <stop offset="1" stopColor="#D081F7" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </a>
                    </div>

                    <div className="wrap-tab-content-img"><img src={require("./images/tab-img.jpeg")} loading="lazy" sizes="(max-width: 767px) 90vw, 29vw" alt="" className="design-img" /></div>
                  </div>
                </div>
                <div data-w-tab="Tab 2" className={`tab-panel w-tab-pane ${activeTab === 'Tab 2' ? 'w--tab-active' : ''}`}>
                  <div className="wrap-tab-content">
                    <div id="w-node-ab328cbf-2622-bd8f-8d8d-df28603d1005-2cc6d822" className="wrao-tab-content-text">
                      <h3 id="w-node-ab328cbf-2622-bd8f-8d8d-df28603d1006-2cc6d822" className="tab-content-title">Bedroom</h3>
                      <div id="w-node-ab328cbf-2622-bd8f-8d8d-df28603d1008-2cc6d822" className="tab-content-subtitle">
                        This tool is designed to help you create the perfect bedroom for your needs. It takes into account your style,
                        and other preferences to come up with a unique design that is tailored for your space.
                      </div>
                      <a href="#" className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal" data-bs-target="#registerModal">
                        <div className="inner-nav-btn">
                          <div className="nav-btn-text">Start Generating</div>
                          <div className="w-embed">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302" stroke="url(#paint0_linear_1_240)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                              <path d="M4.49219 13.5076L13.4176 4.58214" stroke="url(#paint1_linear_1_240)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                              <defs>
                                <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#9ED4FC"></stop>
                                  <stop offset="1" stopColor="#D081F7"></stop>
                                </linearGradient>
                                <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#9ED4FC"></stop>
                                  <stop offset="1" stopColor="#D081F7"></stop>
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </a>
                    </div>
                    <div className="wrap-tab-content-img"><img src={require("./images/tab-bedroom.jpeg")} loading="lazy" sizes="(max-width: 767px) 90vw, 29vw" alt="" className="design-img" /></div>

                  </div>
                </div>
                <div data-w-tab="Tab 3" className={`tab-panel w-tab-pane ${activeTab === 'Tab 3' ? 'w--tab-active' : ''}`}>
                  <div className="wrap-tab-content">
                    <div id="w-node-_175bf81b-744a-bb42-ff53-fc224f5e962d-2cc6d822" className="wrao-tab-content-text">
                      <h3 id="w-node-_175bf81b-744a-bb42-ff53-fc224f5e962e-2cc6d822" className="tab-content-title">Kitchen</h3>
                      <div id="w-node-_175bf81b-744a-bb42-ff53-fc224f5e9630-2cc6d822" className="tab-content-subtitle">Using
                        this AI-powered tool to generate a kitchen design can be an exciting way to add value to your home.
                        This type of system can help you design a kitchen that is both functional and stylish.</div>
                      <a href="#" className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal"
                        data-bs-target="#registerModal">
                        <div className="inner-nav-btn">
                          <div className="nav-btn-text">Start Generating</div>
                          <div className="w-embed"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302" stroke="url(#paint0_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <path d="M4.49219 13.5076L13.4176 4.58214" stroke="url(#paint1_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <defs>
                              <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                              <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                            </defs>
                          </svg></div>
                        </div>
                      </a>
                    </div>

                    <div className="wrap-tab-content-img"><img src={require("./images/tab-kitchen.jpeg")} loading="lazy" sizes="(max-width: 767px) 90vw, 29vw" alt="" className="design-img" /></div>

                  </div>
                </div>
                <div data-w-tab="Tab 4" className={`tab-panel w-tab-pane ${activeTab === 'Tab 4' ? 'w--tab-active' : ''}`}>
                  <div className="wrap-tab-content">
                    <div id="w-node-_6dbc9818-03aa-ff4c-88db-2787acbc7838-2cc6d822" className="wrao-tab-content-text">
                      <h3 id="w-node-_6dbc9818-03aa-ff4c-88db-2787acbc7839-2cc6d822" className="tab-content-title">Bathroom</h3>
                      <div id="w-node-_6dbc9818-03aa-ff4c-88db-2787acbc783b-2cc6d822" className="tab-content-subtitle">A
                        bathroom is one of the most important rooms in our homes. It's a place where we can relax and
                        rejuvenate after a long day. Now, there's a new way to make your bathroom even more relaxing
                        and enjoyable: by using Archi AI to design it.</div>
                      <a href="#" className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal"
                        data-bs-target="#registerModal">
                        <div className="inner-nav-btn">
                          <div className="nav-btn-text">Start Generating</div>
                          <div className="w-embed"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302" stroke="url(#paint0_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <path d="M4.49219 13.5076L13.4176 4.58214" stroke="url(#paint1_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <defs>
                              <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                              <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                            </defs>
                          </svg></div>
                        </div>
                      </a>
                    </div>

                    <div className="wrap-tab-content-img"><img src={require("./images/tab-bathroom.jpeg")} loading="lazy" sizes="(max-width: 767px) 90vw, 29vw" alt="" className="design-img" /></div>

                  </div>
                </div>
                <div data-w-tab="Tab 5" className={`tab-panel w-tab-pane ${activeTab === 'Tab 5' ? 'w--tab-active' : ''}`}>
                  <div className="wrap-tab-content">
                    <div id="w-node-_4df38c96-2de1-1c89-abd2-cea9dfff33d0-2cc6d822" className="wrao-tab-content-text">
                      <h3 id="w-node-_4df38c96-2de1-1c89-abd2-cea9dfff33d1-2cc6d822" className="tab-content-title">Dining Room</h3>
                      <div id="w-node-_4df38c96-2de1-1c89-abd2-cea9dfff33d3-2cc6d822" className="tab-content-subtitle">This tool
                        can create a custom dining room based on your specific needs and preferences. With this tool, you
                        can input your desired features and see how they would look in real life. This can be a great way to
                        get inspired and find new ideas for your dining room.</div>
                      <a href="#" className="outer-nav-btn w-inline-block" type="button" data-bs-toggle="modal"
                        data-bs-target="#registerModal">
                        <div className="inner-nav-btn">
                          <div className="nav-btn-text">Start Generating</div>
                          <div className="w-embed"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.06958 4.49197L13.5078 4.49197L13.5078 10.9302" stroke="url(#paint0_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <path d="M4.49219 13.5076L13.4176 4.58214" stroke="url(#paint1_linear_1_240)"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            </path>
                            <defs>
                              <linearGradient id="paint0_linear_1_240" x1="9.94983" y1="7.37222" x2="13.1136" y2="4.21531"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                              <linearGradient id="paint1_linear_1_240" x1="4.80852" y1="13.8239" x2="13.8059" y2="5.30937"
                                gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9ED4FC"></stop>
                                <stop offset="1" stopColor="#D081F7"></stop>
                              </linearGradient>
                            </defs>
                          </svg></div>
                        </div>
                      </a>
                    </div>

                    <div className="wrap-tab-content-img"><img src={require("./images/tab-diningroom.jpeg")} loading="lazy" sizes="(max-width: 767px) 90vw, 29vw" alt="" className="design-img" /></div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section wf-section">
        <div className="container w-container">
          <div className="wrap-text">
            <div className="main-label">THE WORLD’S MOST ADVANCED AI MODEL</div>
            <div className="over-hide">
              <h1 className="main-title">Why Choose ArchiFlow?</h1>
            </div>
            <div className="over-hide _w-70"></div>
          </div>
          <div className="mt-5">
            <div data-w-id="3abe6409-ab9b-8d12-ced4-6e2bb3093897" className="grid-model">
              <div id="w-node-d0fce74a-60aa-fa37-cdab-aee1eaabd8de-2cc6d822"
                data-w-id="d0fce74a-60aa-fa37-cdab-aee1eaabd8de" className="card-model">
                <div className="w-embed">
                  <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M30.0333 38.5H13.0408C11.9302 38.5 11.3748 38.5 11.1177 38.2804C10.8946 38.0898 10.7761 37.8039 10.7992 37.5114C10.8257 37.1743 11.2184 36.7816 12.0037 35.9962L27.5925 20.4075C28.3185 19.6815 28.6815 19.3185 29.1001 19.1825C29.4683 19.0628 29.865 19.0628 30.2332 19.1825C30.6518 19.3185 31.0148 19.6815 31.7408 20.4075L38.8333 27.5V29.7M30.0333 38.5C33.1136 38.5 34.6537 38.5 35.8303 37.9005C36.8652 37.3732 37.7065 36.5318 38.2338 35.497C38.8333 34.3204 38.8333 32.7803 38.8333 29.7M30.0333 38.5H14.6333C11.553 38.5 10.0129 38.5 8.83637 37.9005C7.80147 37.3732 6.96008 36.5318 6.43278 35.4969C5.83331 34.3204 5.83331 32.7803 5.83331 29.7V14.3C5.83331 11.2197 5.83331 9.67957 6.43278 8.50305C6.96008 7.46816 7.80147 6.62677 8.83637 6.09946C10.0129 5.5 11.553 5.5 14.6333 5.5H30.0333C33.1136 5.5 34.6537 5.5 35.8303 6.09946C36.8652 6.62677 37.7065 7.46816 38.2338 8.50305C38.8333 9.67957 38.8333 11.2197 38.8333 14.3V29.7M19.5833 15.5833C19.5833 17.6084 17.9417 19.25 15.9166 19.25C13.8916 19.25 12.25 17.6084 12.25 15.5833C12.25 13.5583 13.8916 11.9167 15.9166 11.9167C17.9417 11.9167 19.5833 13.5583 19.5833 15.5833Z"
                      stroke="url(#paint0_linear_1_253)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                    <defs>
                      <linearGradient id="paint0_linear_1_253" x1="5.83331" y1="22" x2="38.8333" y2="22"
                        gradientunits="userSpaceOnUse">
                        <stop stop-color="#9ED4FC"></stop>
                        <stop offset="1" stop-color="#D081F7"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="card-model-title">Powered by AI</h2>
                <div className="card-model-subtitle">The AI model is nothing like you've seen before: natural, unique and creative.</div>
              </div>
              <div
                id="w-node-_13ddfea0-05e1-22ae-7539-9ec4db6e61dd-2cc6d822"
                data-w-id="13ddfea0-05e1-22ae-7539-9ec4db6e61dd"
                className="card-model"
              >
                <div className="w-embed">
                  <svg
                    width="45"
                    height="44"
                    viewBox="0 0 45 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30.0333 38.5H13.0408C11.9302 38.5 11.3748 38.5 11.1177 38.2804C10.8946 38.0898 10.7761 37.8039 10.7992 37.5114C10.8257 37.1743 11.2184 36.7816 12.0037 35.9962L27.5925 20.4075C28.3185 19.6815 28.6815 19.3185 29.1001 19.1825C29.4683 19.0628 29.865 19.0628 30.2332 19.1825C30.6518 19.3185 31.0148 19.6815 31.7408 20.4075L38.8333 27.5V29.7M30.0333 38.5C33.1136 38.5 34.6537 38.5 35.8303 37.9005C36.8652 37.3732 37.7065 36.5318 38.2338 35.497C38.8333 34.3204 38.8333 32.7803 38.8333 29.7M30.0333 38.5H14.6333C11.553 38.5 10.0129 38.5 8.83637 37.9005C7.80147 37.3732 6.96008 36.5318 6.43278 35.4969C5.83331 34.3204 5.83331 32.7803 5.83331 29.7V14.3C5.83331 11.2197 5.83331 9.67957 6.43278 8.50305C6.96008 7.46816 7.80147 6.62677 8.83637 6.09946C10.0129 5.5 11.553 5.5 14.6333 5.5H30.0333C33.1136 5.5 34.6537 5.5 35.8303 6.09946C36.8652 6.62677 37.7065 7.46816 38.2338 8.50305C38.8333 9.67957 38.8333 11.2197 38.8333 14.3V29.7M19.5833 15.5833C19.5833 17.6084 17.9417 19.25 15.9166 19.25C13.8916 19.25 12.25 17.6084 12.25 15.5833C12.25 13.5583 13.8916 11.9167 15.9166 11.9167C17.9417 11.9167 19.5833 13.5583 19.5833 15.5833Z"
                      stroke="url(#paint0_linear_1_253)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <defs>
                      <linearGradient
                        id="paint0_linear_1_253"
                        x1="5.83331"
                        y1="22"
                        x2="38.8333"
                        y2="22"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#9ED4FC"></stop>
                        <stop offset="1" stopColor="#D081F7"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="card-model-title">Visualize Your Space</h2>
                <div className="card-model-subtitle">
                  Not only can you see how the different rooms in your project will look
                  like before they are built, but you can also see them in real time!
                </div>
              </div>
              <div
                id="w-node-_8f66b9e1-4f81-07d8-ed8f-2e2bfdebf758-2cc6d822"
                data-w-id="8f66b9e1-4f81-07d8-ed8f-2e2bfdebf758"
                className="card-model"
              >
                <div className="w-embed">
                  <svg
                    width="45"
                    height="44"
                    viewBox="0 0 45 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30.0333 38.5H13.0408C11.9302 38.5 11.3748 38.5 11.1177 38.2804C10.8946 38.0898 10.7761 37.8039 10.7992 37.5114C10.8257 37.1743 11.2184 36.7816 12.0037 35.9962L27.5925 20.4075C28.3185 19.6815 28.6815 19.3185 29.1001 19.1825C29.4683 19.0628 29.865 19.0628 30.2332 19.1825C30.6518 19.3185 31.0148 19.6815 31.7408 20.4075L38.8333 27.5V29.7M30.0333 38.5C33.1136 38.5 34.6537 38.5 35.8303 37.9005C36.8652 37.3732 37.7065 36.5318 38.2338 35.497C38.8333 34.3204 38.8333 32.7803 38.8333 29.7M30.0333 38.5H14.6333C11.553 38.5 10.0129 38.5 8.83637 37.9005C7.80147 37.3732 6.96008 36.5318 6.43278 35.4969C5.83331 34.3204 5.83331 32.7803 5.83331 29.7V14.3C5.83331 11.2197 5.83331 9.67957 6.43278 8.50305C6.96008 7.46816 7.80147 6.62677 8.83637 6.09946C10.0129 5.5 11.553 5.5 14.6333 5.5H30.0333C33.1136 5.5 34.6537 5.5 35.8303 6.09946C36.8652 6.62677 37.7065 7.46816 38.2338 8.50305C38.8333 9.67957 38.8333 11.2197 38.8333 14.3V29.7M19.5833 15.5833C19.5833 17.6084 17.9417 19.25 15.9166 19.25C13.8916 19.25 12.25 17.6084 12.25 15.5833C12.25 13.5583 13.8916 11.9167 15.9166 11.9167C17.9417 11.9167 19.5833 13.5583 19.5833 15.5833Z"
                      stroke="url(#paint0_linear_1_253)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_1_253"
                        x1="5.83331"
                        y1="22"
                        x2="38.8333"
                        y2="22"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#9ED4FC" />
                        <stop offset="1" stopColor="#D081F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="card-model-title">Cost-Effective</h2>
                <div className="card-model-subtitle">
                  You will find that your design process is less complicated and more efficient, saving you time and money.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section wf-section" id="pricing">
        <div className="container w-container">
          <div className="wrap-text">
            <div className="over-hide">
              <h2 className="main-title">Generate Unlimited Designs</h2>
            </div>
            <div className="over-hide _w-70">
              <div className="main-subtitle">Archi AI has helped thousands transform their living spaces into dream
                environments.<br />Try Archi AI today and experience the future of interior design!</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="wrap-pricing-card">
              <div className="pricing-card">
                <div className="pricing-card-label">Pro</div>
                <div className="card-pricing-price">$19<span className="period">/mo</span></div>
                <div className="card-pricing-feature">
                  <div className="feature-item">
                    <div className="w-embed">
                      {/* SVG code here */}
                    </div>
                    <div className="feature-text">Unlimited renders</div>
                  </div>
                  {/* Repeat similar structure for other features */}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} type="button" data-bs-toggle="modal"
                  data-bs-target="#registerModal">Get started</button>
              </div>
              {/* Repeat similar structure for the second pricing card */}
            </div>
          </div>
        </div>
      </div>
      <div className="footer wf-section">
        <div className="container w-container">
          <div className="wrap-footer-menu" data-w-id="648f99e2-698e-ce2a-854b-df012cbcfa11">
            <div id="w-node-de161822-281d-e202-6bab-f82fc2f12093-2cc6d822" data-w-id="de161822-281d-e202-6bab-f82fc2f12093" className="footer-menu _w-70">

              <div id="w-node-_3fe3b868-dab9-8ce4-4c5f-786a12343696-2cc6d822" className="footer-text">Transform Ideas to Life: Instantly Generate Realistic 3D Models of Your Spaces. Harness the Power of Cutting-edge AI Interior Design for Enhanced Productivity.</div>
              <div className="footer-sosmed">
                <a href="https://www.facebook.com/" target="_blank" rel="nofollow" className="sosmed-item w-inline-block">
                  <div className="w-embed">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 6H13.5C12.9477 6 12.5 6.44772 12.5 7V10H16.5C16.6137 9.99748 16.7216 10.0504 16.7892 10.1419C16.8568 10.2334 16.8758 10.352 16.84 10.46L16.1 12.66C16.0318 12.8619 15.8431 12.9984 15.63 13H12.5V20.5C12.5 20.7761 12.2761 21 12 21H9.5C9.22386 21 9 20.7761 9 20.5V13H7.5C7.22386 13 7 12.7761 7 12.5V10.5C7 10.2239 7.22386 10 7.5 10H9V7C9 4.79086 10.7909 3 13 3H16.5C16.7761 3 17 3.22386 17 3.5V5.5C17 5.77614 16.7761 6 16.5 6Z" fill="#AFAFAF"></path>
                    </svg>
                  </div>
                </a>
                {/* Similar code for other social media links */}
              </div>
            </div>
            <div className="inner-wrap-footer-menu">
              {/* Footer Menu Section 1 */}
              <div className="footer-menu" id="w-node-_70a4b4bd-40c3-26bb-d419-03bf0b8c8680-2cc6d822">
                <div className="footer-menu-title">Navigate</div>
                <a href="index.html" className="footer-link">Home</a>
                <a href="#pricing" className="footer-link">Pricing</a>
                <a href="#" className="footer-link" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>
                <a href="#" className="footer-link" data-bs-toggle="modal" data-bs-target="#registerModal">Sign Up</a>
              </div>

              {/* Footer Menu Section 2 */}
              <div className="footer-menu" id="w-node-_2998d1ef-b0f4-b6ff-9599-57fe83c0de49-2cc6d822">
                <div className="footer-menu-title">Support Us</div>
                <a href="#faq" className="footer-link">FAQ</a>
                <a href="#" className="footer-link">Contact Us</a>
                <a href="#" className="footer-link">Support Center</a>
                <a href="#" className="footer-link">Security</a>
              </div>

              {/* Footer Menu Section 3 */}

            </div>
          </div>
          <div className="footer-label">
            <div className="footer-label-copytight">© ArchiFlow AI 2023. All Rights Reserved.</div>
            <div className="footer-bot">
              <a href="#" className="footer-bot-link">Terms &amp; Conditions</a>
              <div className="align-center w-embed">
                <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="2" cy="2" r="2" fill="white"></circle>
                </svg>
              </div>
              <a href="#" className="footer-bot-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
