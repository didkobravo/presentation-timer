import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Save, RefreshCw } from 'lucide-react';
import './PresentationTimer.css';

const GIST_URL = 'https://gist.githubusercontent.com/didkobravo/8e17048aabc46225b9fa183dcfb21c3b/raw/25098ad72762cd53b4e739ee5424b9fcf091fdc3/presentation-script.json';

const PresentationTimer = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [slideTimer, setSlideTimer] = useState(15);
    const [isEditing, setIsEditing] = useState(false);
    const [totalTime, setTotalTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize slides from localStorage or empty array
    const [slides, setSlides] = useState(() => {
        const savedSlides = localStorage.getItem('presentationSlides');
        return savedSlides ? JSON.parse(savedSlides) : [];
    });

    // Fetch slides from gist
    const fetchSlides = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(GIST_URL);
            const data = await response.json();
            setSlides(data.slides);
            localStorage.setItem('presentationSlides', JSON.stringify(data.slides));
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching slides:', error);
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchSlides();
    }, []);

    // Save to localStorage when slides change
    useEffect(() => {
        localStorage.setItem('presentationSlides', JSON.stringify(slides));
    }, [slides]);


    // Initial slides data
    const initialSlides = [
        "От парфюмирана хартия със златни ръбове до 'нова среща' в календара... Дворцовият протокол е жив!",
        // We'll add more slides later
    ];

    // Save slides to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('presentationSlides', JSON.stringify(slides));
    }, [slides]);

    // Timer logic for individual slides
    useEffect(() => {
        let interval;
        if (isPlaying && slideTimer > 0 && !isEditing) {
            interval = setInterval(() => {
                setSlideTimer((prev) => prev - 1);
            }, 1000);
        } else if (slideTimer === 0) {
            setSlideTimer(15);
            if (currentSlide < slides.length - 1) {
                setCurrentSlide((prev) => prev + 1);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearInterval(interval);
    }, [isPlaying, slideTimer, currentSlide, slides.length, isEditing]);

    // Total time counter
    useEffect(() => {
        let interval;
        if (isPlaying && !isEditing) {
            interval = setInterval(() => {
                setTotalTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isEditing]);

    // Helper function to format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Navigation handlers
    const togglePlay = () => {
        if (isEditing) {
            setIsEditing(false);
        }
        setIsPlaying(!isPlaying);
    };

    const nextSlide = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
            setSlideTimer(15);
            setIsEditing(false);
        }
    }, [currentSlide, slides.length]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
            setSlideTimer(15);
            setIsEditing(false);
        }
    }, [currentSlide]);

    // Reset total time
    const resetTime = () => {
        setTotalTime(0);
        setSlideTimer(15);
        setCurrentSlide(0);
        setIsPlaying(false);
    };

    // Handle text updates
    const handleTextChange = (e) => {
        const newSlides = [...slides];
        newSlides[currentSlide] = e.target.value;
        setSlides(newSlides);
    };

    const toggleEdit = () => {
        if (isPlaying) {
            setIsPlaying(false);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="timer-container">
            {isLoading ? (
                <div className="loading">Loading presentation...</div>
            ) : (
                <div className="timer-card">
                    {/* Add sync button at the top */}
                    <button
                        onClick={fetchSlides}
                        className="sync-button"
                        title="Sync with latest version"
                    >
                        <RefreshCw size={20} />
                    </button>
    
                    {/* Progress bar */}
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(slideTimer / 15) * 100}%` }}
                        />
                    </div>
    
                    {/* Timers */}
                    <div className="timers">
                        <div className="slide-timer">
                            {slideTimer}s
                        </div>
                        <div className="total-timer">
                            Total: {formatTime(totalTime)}
                            <button
                                onClick={resetTime}
                                className="reset-button"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
    
                    {/* Slide content */}
                    <div className="slide-content">
                        {isEditing ? (
                            <textarea
                                value={slides[currentSlide]}
                                onChange={handleTextChange}
                                className="slide-textarea"
                                autoFocus
                            />
                        ) : (
                            <div onClick={toggleEdit} className="slide-text">
                                {slides[currentSlide]}
                            </div>
                        )}
                    </div>
    
                    {/* Progress indicator */}
                    <div className="progress-indicator">
                        Slide {currentSlide + 1} of {slides.length}
                    </div>
                </div>
            )}
            
            {/* Controls */}
            <div className="controls">
                <button
                    onClick={prevSlide}
                    className="control-button"
                >
                    <SkipBack size={24} />
                </button>
                <button
                    onClick={togglePlay}
                    className="control-button"
                >
                    {isPlaying ? (
                        <Pause size={24} />
                    ) : (
                        <Play size={24} />
                    )}
                </button>
                <button
                    onClick={nextSlide}
                    className="control-button"
                >
                    <SkipForward size={24} />
                </button>
                <button
                    onClick={toggleEdit}
                    className={`control-button ${isEditing ? 'edit-active' : ''}`}
                >
                    <Save size={24} />
                </button>
            </div>
        </div>
    );
};

export default PresentationTimer;