import { isVisible } from "@testing-library/user-event/dist/utils";
import React, { useState, useEffect } from "react";

function WordFall() {

    // State to store the list of words
    const [words, setWords] = useState([]);

    // State for the input text field
    const [inputText, setInputText] = useState("");

    // State to track whether the game has started
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            console.log("Key pressed:", event.key); // Logs the key
            handleKeyboard(event.key);
        };

        // Attach event listener
        window.addEventListener("keydown", handleKeyDown);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function handleKeyboard(key){


    }


    const handleStart = () => {
        console.log("handleStart");
        console.log(inputText);
        // Convert the input text into an array of word objects
        const wordArray = inputText.split(" ").map((word) => ({
            word: word, // The word itself
            letterlist: word.split("").map((letter) => ({
                letter: letter, // Each letter
                isTyped: false, // Whether the letter has been typed
            })),
            isFocused: false, // Future feature: whether the word is currently focused
            isVisible: false, // Visibility on the screen
        }));
        console.log(wordArray);

        setWords(() =>
            wordArray.map((word, i) => {
                if (i === countVisible(wordArray)) {
                    return { ...word, isVisible: true };
                }
                return word;
            })
        );

    };


    function countVisible(words) {
        return words.filter((w) => w.isVisible).length;
    }


    useEffect(() => {
        console.log(words.length);
        console.log(countVisible(words));


        const interval = setInterval(() => {
            if (countVisible(words) < 5 && inputText !== "") {
                addVisible();
            } else {
                setInputText("")
            }
        }, 5000); // Trigger every second
        return () => clearInterval(interval); // Cleanup on unmount



    }, [words]);

    /**
     * Adds the next word to the visible list.
     */
    function addVisible() {
        setWords((prevWords) =>
            prevWords.map((word, i) => {
                if (i === countVisible(prevWords)) {
                    return { ...word, isVisible: true };
                }
                return word;
            })
        );
        console.log("after added visible:");
        console.log(words);



    }

    const handleCopy = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setInputText(clipboardText.slice(0, 50));

        } catch (error) {
            console.error('Error copying text:', error);
        }
    };

    useEffect(() => {
        console.log('inputText updated:', inputText);
        if (inputText !== "") {
            handleStart()
        }
    }, [inputText]);

    return (
        <div style={styles.container}>
            {/* Input section */}
            <div style={styles.wordList}>
                <div style={styles.word}>
                    <div style={styles.pasteContainer}>
                        <button onClick={handleCopy} style={styles.pasteButton}>Paste Text</button>
                        <p style={styles.pastedText} fontSize="4px" color="white">{inputText}</p>
                    </div>
                </div>
            </div>

            {/* Game area */}
            {countVisible(words) >= 5 ? (
                // Game Over Screen
                <div>
                    <h1 style={styles.gameOverText}>Game Over!</h1>
                    <p>Paste some text to restart</p>
                </div>
            ) : (
                <div style={styles.wordList}>
                    {/* Display visible words */}
                    {words.slice().reverse().map((w, index) =>
                        w.isVisible && w.word != "" ? (
                            <div key={index} style={styles.word}>
                                {w.word}
                            </div>
                        ) : null
                    )}
                </div>
            )}

            {/* Image at the bottom */}
            <div style={styles.bottomBanner}>
                <div style={styles.word}>Type it hero!</div>


            </div>
        </div>
    );
}

// Styles
const styles = {
    container: {
        height: "100vh",
        background: "#121212",
        color: "white",
        overflow: "hidden",
    },
    gameOverText: {
        textAlign: "center",
    },
    wordList: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    word: {
        height: "15vh", //         width: "50%",
        fontSize: "7vh",
        width: "70%",
        background: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "5px",
    },
    bottomBanner: {
        position: "absolute", // Ensures the image stays at the bottom
        bottom: 0,
        height: "15vh",
        width: "100%",
        left: "50%",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        transform: "translateX(-50%)", // Centers the image horizontally
    },
    inputContainer: {
        display: "flex",
        width: "100%",
        height: "10vh",
        background: "black",
    },
    input: {
        width: "80%",
        padding: "10px",
        fontSize: "16px",
        border: "none",
        outline: "none",
        textAlign: "start",
    },
    startButton: {
        width: "20%",
        padding: "10px",
        fontSize: "16px",
        background: "yellow",
        color: "black",
        border: "none",
        cursor: "pointer",
        textAlign: "center",
    },
    pasteButton: {
        padding: "10px 20px",
        fontSize: "16px",
        fontWeight: "bold",
        backgroundColor: "red", // Blue color
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        transition: "background-color 0.3s ease",
    },
    pastedText: {
        fontSize: "8px",
        color: "white",
        textAlign: "center",
        maxWidth: "80%", // Limits width to avoid text overflow
    },
    pasteContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
    }
};

export default WordFall;
