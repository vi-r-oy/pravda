import start from "../../assets/start.png"
import "./style.scss"
import React, { useEffect, useRef, useState } from "react"
import Sentiment from "sentiment"
import MicRecorder from "mic-recorder-to-mp3"
import axios from "axios"

import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

const sentiment = new Sentiment()

const visualValueCount = 9

let recorder = new MicRecorder({ bitRate: 128 })

const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "e2d98c1496ca45378c8fe5154eaa6133",
      "content-type": "application/json",
      "transfer-encoding": "chunked",
    },
  })


const SpeechDetector = (props) => {
    const [clicked, setClicked] = useState(false)
    const visualizerRef = useRef(null)
    const [audioFile, setAudioFile] = useState(null)
    const [transcriptID, setTranscriptID] = useState("")
    const [transcriptData, setTranscriptData] = useState("")
    const [customTranscript, setCustomTranscript] = useState("")


    const processFrame = (data) => {
        const values = Object.values(data)
        const dataMap = { 0: 5, 1: 2, 2: 0, 3: 3, 4: 5, 5: 2, 6: 0, 7: 3, 8: 5 }
        const visualElements = document.querySelectorAll("#visualizer > div")

        for (let i = 0; i < visualValueCount; ++i) {
            const value = values[dataMap[i]] / 255
            if (visualElements && visualElements[i]) {
                const elmStyles = visualElements[i].style
                elmStyles.height = `${value * 60}px`
            }
            //elmStyles.transform = `scaleY( ${ value } )`;
            //elmStyles.opacity = Math.max( .25, value )
        }
    }

    const startRecordingAudio = () => {
        // Check if recording isn't blocked by browser
        recorder.start().then(() => {
        //   setIsRecording(true)
        })
      }
    
      const stopRecordingAudio = () => {
        recorder
          .stop()
          .getMp3()
          .then(([buffer, blob]) => {
            const file = new File(buffer, "audio.mp3", {
              type: blob.type,
              lastModified: Date.now(),
            })
            const newBlobUrl = URL.createObjectURL(blob)
            // setBlobUrl(newBlobUrl)
            // setIsRecording(false)
            setAudioFile(file)
            console.debug("File:", file, newBlobUrl)
          })
          .catch((e) => console.log(e))
      }

    const startRecording = () => {
        props.startRecording()
        props.startTimer()
        setClicked(true)
        console.debug("Listening now")

        SpeechRecognition.startListening()

        const audioContext = new AudioContext()

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                const analyser = audioContext.createAnalyser()
                const source = audioContext.createMediaStreamSource(stream)
                source.connect(analyser)
                analyser.smoothingTimeConstant = 0.5
                analyser.fftSize = 32

                const initRenderLoop = (analyser) => {
                    console.log(stream)
                    const frequencyData = new Uint8Array(analyser.frequencyBinCount)

                    const renderFrame = () => {
                        analyser.getByteFrequencyData(frequencyData)
                        processFrame(frequencyData)

                        requestAnimationFrame(renderFrame)
                    }

                    requestAnimationFrame(renderFrame)
                }

                initRenderLoop(analyser)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const [uploadURL, setUploadURL] = useState("")

  // Upload the Audio File and retrieve the Upload URL
  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  useEffect(() => {
    if (uploadURL) {
        assembly
        .post("/transcript", {
            audio_url: uploadURL,
        })
        .then((res) => {
            console.debug("Transcript id:", res.data.id)
            setTranscriptID(res.data.id)
        })
        .catch((err) => console.error(err))

        console.log("Transcript id:", transcriptID)
    }
}, [uploadURL])

const checkStatusHandler = async () => {
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data)
        console.debug("transcriptData:", res.data)
		setCustomTranscript(res.data.text)
      })
    } catch (err) {
      console.error(err)
    }
  }

//   console.log(transcriptData)
//   console.log("transcriptData:", transcriptData)

  useEffect(() => {
    if(transcriptID) {
        const interval = setInterval(() => {
        if (transcriptData.status !== "completed") {
            checkStatusHandler()
        } else {
            // setIsLoading(false)
            setCustomTranscript(transcriptData.text)
            console.debug("Transcript:", transcriptData)


            clearInterval(interval)
        }
        }, 1000)
        return () => clearInterval(interval)
    }
  }, [transcriptID])


  console.log("Upload url:", uploadURL)

    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
        } = useSpeechRecognition();
    
    // console.log("Transcript:", {transcript,
    //     interimTranscript,
    //     finalTranscript,
    //     resetTranscript,
    // })


    const handleListing = () => {
        console.debug("Starting to listen")

        // setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
        });
        };


        const stopHandle = () => {
            // setIsListening(false);
            SpeechRecognition.stopListening();
        };

        const handleReset = () => {
            stopHandle();
            resetTranscript();
        };
        
        useEffect(() => {
            if (finalTranscript !== '') {
                console.log('Got final result:', finalTranscript);
                const score = sentiment.analyze(finalTranscript)
            }
        }, [interimTranscript, finalTranscript]);


    useEffect(() => {
        handleListing()

        props.setCurrentTranscript((transcriptinput) => {
            console.debug("Transcript:", transcript)

            return transcriptinput + " " + transcript
        })

        if (transcript.length > 130) {
            resetTranscript()
        }
    }, [transcript])


    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return null
    }

    return (
        <>
        {/* <div style={{ zIndex: 9999}}>
                    <p>Microphone: {listening ? 'on' : 'off'}</p>
                    <button onClick={() => {console.log("Done"); SpeechRecognition.startListening(); console.log("Transcript:", transcript)}}>Start</button>
                    <button onClick={() => {console.log("Stopped"); SpeechRecognition.stopListening(); console.log("Transcript:", transcript)}}>Stop</button>
                    <button onClick={resetTranscript}>Reset</button>
                    <p>{transcript}</p>
                    </div> */}

            <div className="speech-detector">
                
                <div id="visualizer" ref={visualizerRef}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>

                <div className="speech-content">
                    <div>
                        <h1>Live Transcript</h1>
                        <span>{customTranscript}&nbsp;</span>
                    </div>
                </div>

                
            </div>

            {!clicked ? <img onClick={() => {
                console.debug("Start recording")
                startRecordingAudio()
                setTimeout(() => {
                    console.debug("Stopping recording audio")
                    stopRecordingAudio()
                }, 5000)
            }} id="start-recording" src={start} /> : null}
        </>
    )
}

export default SpeechDetector
