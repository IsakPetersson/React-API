import React, { useEffect, useState } from "react";

// Starting date: October 13, 2025, 21:15 CET
const START_DATE = new Date("2025-10-13T19:15:00Z"); // CET is UTC+2, so 21:15 CET = 19:15 UTC
const TERM_LENGTH_MS = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

function getNextTermEnd() {
    const now = new Date();
    const elapsed = now - START_DATE;
    const termsPassed = Math.floor(elapsed / TERM_LENGTH_MS);
    const nextEnd = new Date(START_DATE.getTime() + (termsPassed + 1) * TERM_LENGTH_MS);
    return nextEnd;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function MayorTermTimer() {
    const [timeLeft, setTimeLeft] = useState(getNextTermEnd() - new Date());
    const [nextEnd, setNextEnd] = useState(getNextTermEnd());

    useEffect(() => {
        const interval = setInterval(() => {
            const end = getNextTermEnd();
            setNextEnd(end);
            setTimeLeft(end - new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ color: "#E732AA", fontWeight: "bold", fontSize: "0.95em", textAlign: "center", marginBottom: "10px" }}>
            <div>Term ends in:</div>
            <div>{formatTime(timeLeft)}</div>
            <div style={{ fontWeight: "normal", fontSize: "0.85em", color: "#fff" }}>
            </div>
        </div>
    );
}