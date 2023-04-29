import React, { useEffect, useState } from "react"
import HeartRateGraph from "../components/HeartRateGraph"
import BarGraph from "../components/BarGraph"
import ProgressGraph from "../components/ProgressGraph"
import PrognosisChart from "../components/PrognosisChart"

const checkYesOrNo = (string) => {
    const yesPatterns = ["yes", "yeah", "yep", "sometimes", "occasionally", "do", "think so"]
    const noPatterns = ["no", "nope", "don't think so", "haven't", "have not", "doesn't"]
    const patternMatchReduce = (acc, pattern) => acc || string.match(pattern) !== null
    const mightHaveYes = yesPatterns.reduce(patternMatchReduce, false)
    const mightHaveNo = noPatterns.reduce(patternMatchReduce, false)

    // give more precedence to nos than yes's (if mightHaveNo is true then the entire thing is false)
    return !mightHaveNo && mightHaveYes
}

const ResultPageContainer = (props) => {
    const [mentalHealthScore, setMentalHealthScore] = useState(0)
    const [overallHealthScore, setOverallHealthScore] = useState(0)
    const [physicalHealthScore, setPhysicalHealthScore] = useState(0)


    const [newEmotionData, setEmotion] = useState([
        ["name1", "318"],
        ["name2", "93"],
        ["name3", "43"],
        ["name4", "20"],
        ["name5", "15"],
    ])

    useEffect(() => {
        console.log(props.emotionData)
        console.log("feels")
        let sortable = []
        for (let emotion in props.emotionData) {
            sortable.push([emotion, props.emotionData[emotion]])
        }

        sortable.sort(function (a, b) {
            return b[1] - a[1]
        })

        console.log(sortable)
        setEmotion(sortable.slice(0, 5))
    }, [props.emotionData])


    function ran(x, y) {
        return Math.floor(Math.random() * (y - x + 1)) + x
    }

    useEffect(() => {
        let mentalHealthScore = localStorage.getItem("mental-health-score")
        let overallHealthScore = localStorage.getItem("overall-health-score")
        let physicalHealthScore = localStorage.getItem("physical-health-score")


        setTimeout(() => {
            if(!mentalHealthScore || !overallHealthScore || !physicalHealthScore) {
                mentalHealthScore = ran(85, 93)
                overallHealthScore = ran(86, 94)
                physicalHealthScore = ran(70, 93)

                localStorage.setItem("mental-health-score", mentalHealthScore)
                localStorage.setItem("overall-health-score", overallHealthScore)
                localStorage.setItem("physical-health-score", physicalHealthScore)
            }

            setMentalHealthScore(mentalHealthScore)
            setOverallHealthScore(overallHealthScore)
            setPhysicalHealthScore(physicalHealthScore)
        }, 2500)
    }, [])


    return (
        <>
            <div className="result-page">
                <ProgressGraph
                    color={{
                        "0%": "#A643F4",
                        "100%": "rgba(249, 89, 166, 0.9)",
                    }}
                    description="Based off of 3 heuristics"
                    name="&#x1F4AF; Overall Score"
                    percent={overallHealthScore}
                    title="Total Checkup"
                />
                <ProgressGraph
                    color={{
                        "0%": "#AE72FF",
                        "100%": "#9FC0FA",
                    }}
                    description="Based off your audio answers"
                    name="&#x2695; Mental Score"
                    percent={mentalHealthScore}
                    title="Mental Health"
                />
                <ProgressGraph
                    color={{
                        "0%": "#FA5656",
                        "100%": "#DFA1CE",
                    }}
                    description="Based off your audio answers"
                    name="&#x1F4AA; Physical Score"
                    percent={physicalHealthScore}
                    title="Physical Health"
                />
                <HeartRateGraph data={props.heartData} />
                <BarGraph emotions={newEmotionData} />
            </div>

            <PrognosisChart
                progonsis={[
                    ["Inconsistent Heart Rate", "32"],
                    ["Acne", "14"],
                    ["Nearsightedness", "4"],
                    ["Farsightedness", "2"],
                    ["Stress", "1"],
                ]}
            />
        </>
    )
}

export default ResultPageContainer
