import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getNextKeyDef } from "@testing-library/user-event/dist/keyboard/getNextKeyDef";
import { isVisible } from "@testing-library/user-event/dist/utils";
import { color } from "motion/react";

function WordFall() {
    const [text, setText] = useState("Paste some text to start the game");
    const [words, setWords] = useState([]);
    const [gameStatus, setGameStatus] = useState({
        cl: 0,
        kl: 0,
        ip: false
    });

    // Memoized function to get the next needed key
    const getNeededKey = useCallback(() => {
        for (const w of words) {
            if (w.isFocused) {
                const untypedLetters = w.letterlist.filter(l => !l.isTyped);
                
                if (untypedLetters.length > 0) {
                    const neededKey = untypedLetters[0];
                    const isLastKey = untypedLetters.length === 1;
                    
                    return {
                        key: neededKey.letter,
                        isLastKey: isLastKey
                    };
                }
            }
        }
        
        return { key: null, isLastKey: false };
    }, [words]);

    // Handle keyboard input with updated state management
    const handleKeyboard = useCallback((k, isLastKey) => {

        if(isLastKey){
            //update KL
            setGameStatus(prevState => {
                if (prevState.cl - prevState.kl == 1 && words.length == prevState.cl) {
                    setText("You won! Paste some text to restart.");
                    return { cl: 0, kl: 0, ip: false };
                } else {
                    return { ...prevState, kl: prevState.kl + 1, ip: true }   
                }
            });

        }else{

            setWords(prevWords => {
                return prevWords.map(word => {
                    if (word.isFocused) {
                        return {
                            ...word,
                            letterlist: word.letterlist.map((letter, index) =>
                                letter.letter === k && !letter.isTyped
                                    // Find the first untyped occurrence of the letter
                                    && word.letterlist
                                        .slice(0, index)
                                        .every(prevLetter => prevLetter.isTyped || prevLetter.letter !== k)
                                    ? { ...letter, isTyped: true }
                                    : letter
                            )
                        };
                    }
                    return word;
                });
            });

        }
        
    }, []);

    // Keyboard event listener
    useEffect(() => {
        const handleKeyDown = (event) => {
            const neededKey = getNeededKey();
            console.log("Needed key:", neededKey);
            console.log("Pressed key:", event.key);

            if (event.key === neededKey.key) {
                handleKeyboard(event.key, neededKey.isLastKey);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [getNeededKey, handleKeyboard]);

    // Paste handler
    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const cleanText = clipboardText.trim().substring(0, 300);

            if (cleanText.split(/\s+/).length > 5) {
                setText(cleanText);
            } else {
                setText("Please paste 5+ words to play");
            }
        } catch (error) {
            console.error("Paste error:", error);
            setText("Error reading clipboard");
        }
    };

    // Initialize words from text
    useEffect(() => {
        const wordArray = text.split(" ").map((word) => ({
            word: word,
            letterlist: word.split("").map((letter) => ({
                letter: letter,
                isTyped: false,
            })),
            isFocused: false,
            isVisible: false,
        }));

        if (wordArray.length > 4) {
            setWords(wordArray);
        }
    }, [text]);

    // Game progression timer
    useEffect(() => {
        let interval;
        if (words.length > 4) {
            interval = setInterval(() => {
                setGameStatus(prevState => {
                    if (prevState.cl-prevState.kl < 4) {
                        return { ...prevState, cl: prevState.cl + 1, ip: true };
                    } else {
                        clearInterval(interval);
                        setText("Game Over! Paste some text to restart.");
                        return { cl: 0, kl: 0, ip: false };
                    }
                });
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [words]);

    // Update word visibility and focus
    useEffect(() => {

        console.log(gameStatus);
        setWords((prevWords) =>
            prevWords.map((word, i) => {
                if (i < gameStatus.cl && i >= gameStatus.kl) {
                    if (i === gameStatus.kl) {
                        return { ...word, isVisible: true, isFocused: true };
                    } else {
                        return { ...word, isVisible: true, isFocused: false };
                    }
                } else {
                    return { ...word, isVisible: false, isFocused: false };
                }
            })
        );
        console.log(gameStatus)
    }, [gameStatus]);

    // Render
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.pasteButton} onClick={handlePaste}>
                    PASTE YOUR TEXT
                </button>
                <p style={styles.inputtext}>{text}</p>
            </div>

            <div style={styles.wordList}>
                {words.slice().reverse().map((w, index) =>
                    w.isVisible && (
                        <div
                            key={index}
                            style={{
                                ...styles.box,
                                border: w.isFocused ? "2px solid red" : "2px solid transparent"
                            }}
                        >
                            <h2>
                                {w.letterlist.map((letter, letterIndex) => (
                                    <span
                                        key={letterIndex}
                                        style={{
                                            color: letter.isTyped ? 'green' : 'white',
                                            textDecoration: letter.isTyped ? 'underline' : 'none'
                                        }}
                                    >
                                        {letter.letter}
                                    </span>
                                ))}
                            </h2>
                        </div>
                    )
                )}
            </div>

            <div style={styles.footer}>
                <h1>Type It Hero!</h1>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "#121212",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "white",
        alignItems: "center"
    },
    box: {
        display: "flex",
        flexDirection: "column",
        background: "#000000",
        height: "15vh",
        width: "75vh",
        justifyContent: "center",
        fontSize: "2vh"
    },
    header: {
        display: "flex",
        flexDirection: "column",
        background: "#000000",
        height: "15vh",
        width: "75vh",
        justifyContent: "center",
        alignItems: "center",
    },
    footer: {
        background: "#000000",
        height: "15vh",
        width: "75vh",
        position: "absolute",
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontSize: "2vh"
    },
    pasteButton: {
        background: "#121212",
        color: "#ffffff",
        padding: "10px",
        border: "none",
        cursor: "pointer",
        fontSize: "2vh",
        fontWeight: "bold"
    },
    wordList: {
        display: "flex",
        width: "75vh",

        flexDirection: "column",
        alignItems: "center",
        fontSize: "2vh"
    },
    inputtext :{
        color : "green"

    }
};

export default WordFall;