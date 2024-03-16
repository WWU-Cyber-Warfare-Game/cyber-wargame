"use client";

import { useState, useEffect } from "react";

interface TimerProps {
    readonly time: Date;
}

export default function Timer({ time }: Readonly<TimerProps>) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [hours, setHours] = useState(0);

    // Update the time left every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(time.getTime() - Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [time]);

    // update the hours, minutes, and seconds
    useEffect(() => {
        if (timeLeft <= 0) return;
        setSeconds(Math.floor((timeLeft / 1000) % 60));
        setMinutes(Math.floor((timeLeft / 1000 / 60) % 60));
        setHours(Math.floor(timeLeft / 1000 / 60 / 60));
    }, [timeLeft]);

    return <p>{hours}h {minutes}m {seconds}s</p>
}