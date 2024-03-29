import { useState, useEffect } from "react"

import Video from "../components/Video"
import Questions from "../components/Questions"
import SpeechDetector from "../components/SpeechDetector"
import Toolbar from "../components/Toolbar"
import Dictaphone from "../components/SpeechDetector/NewSpeech"

let currentRecorder = null
const CameraPage = (props) => {
    const [questionIndex, setQuestionIndex] = useState(1)
    const [timer, setTimer] = useState(0)
    const [currentTranscript, setCurrentTranscript] = useState("hello")
    const [started, setStarted] = useState(false)

    const moveNext = async () => {
        if (questionIndex < 10) {
            setQuestionIndex(questionIndex + 1)
            console.log(currentTranscript)
        } else {
            props.setNext()
            //await currentRecorder.stop(questionIndex);
        }
    }

    const moveBack = async () => {
        if (questionIndex > 1) {
            console.log(currentTranscript)
            setQuestionIndex(questionIndex - 1)
        }
    }

    useEffect(() => {
        if (started) {
            setTimeout(() => {
                setTimer(timer + 1)
            }, 1000)
        }
    }, [timer])

    const recordAudio = () =>
        new Promise(async (resolve) => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 128000, mimeType: "audio/mp3" })
            const audioChunks = []

            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data)
            })

            const start = () => {
                mediaRecorder.start()
                console.log("recording started!")
            }

            const stop = (index) =>
                new Promise((resolve) => {
                    mediaRecorder.addEventListener("stop", async () => {
                        const audioBlob = new Blob(audioChunks, { type: "audio/ogg" })
                        const audioUrl = URL.createObjectURL(audioBlob)
                        const audio = new Audio(audioUrl)
                        const play = () => audio.play()
                        resolve({ audioBlob, audioUrl, play })

                        // const response = await fetch(`https://api.assemblyai.com/v2/transcript`, {
                        //     method: 'POST',
                        //     headers: {
                        //         "Content-Type": "application/json",
                        //         "authorization": "e2d98c1496ca45378c8fe5154eaa6133",
                        //     },
                        //     body: {
                        //         audio_url: JSON.stringify(payload)
                        //     },
                        // }).then(response => response.json())
                        //     .then(data => {
                        //         console.log("Successful API call!");
                        //         console.log(data);
                        //     })
                        //     .catch(error => {
                        //         throw new Error(error);
                        //     });

                        // TODO: Replace with google speech to text response
                        // setRecordings((recordings) => {
                        //     const newRecordings = {...recordings};
                        //     newRecordings[index] = audioUrl;
                        // });
                    })

                    mediaRecorder.stop()
                })

            resolve({ start, stop })
            console.log("recording is gone")
        })

    const startRecording = async () => {
        // console.debug("Recording started")
        // currentRecorder = await recordAudio();
        // currentRecorder.start();
    }

    return (
        <div>
            <Video started={started} data={props.data} setData={props.setData} setEmotions={props.setEmotions} />
            <SpeechDetector
                setCurrentTranscript={setCurrentTranscript}
                startTimer={() => {
                    setStarted(true)
                    setTimer(1)
                }}
                startRecording={startRecording}
            />

            <Questions questionIndex={questionIndex} totalQuestions={10} moveNext={moveNext} moveBack={moveBack} />
            <Toolbar timer={timer} moveNext={moveNext} moveBack={moveBack} />

            <Dictaphone></Dictaphone>
        </div>
    )
}

export default CameraPage
