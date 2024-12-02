import { color } from "motion/react";
import React, { useEffect } from "react";


function WordFall() {

    const [text, setText] = React.useState("");
    const [words, setWords] = React.useState([]);
    const [gameStatus, setGameStatus] = React.useState({
        cl: 0,
        kl: 0,
        ip: false
    })

    const handlePaste = async () => {
        const clipboardText = await navigator.clipboard.readText();
        console.log("Text Pasted...")
        console.log(clipboardText)

        const cleanText = clipboardText.trim().substring(0, 300);

        if (cleanText.split(/\s+/).length > 5) {
            setText(cleanText)
        } else {
            console.log("Text was invalid")
            setText("Please paste 5+ words to play")
        }
    }

    useEffect(() => {

        //set up the words state

        const wordArray = text.split(" ").map((word) => ({
            word: word,
            letterlist: word.split("").map((letter) => ({
                letter: letter,
                isTyped: false,
            })),
            isFocused: false,
            isVisible: false,
        }));

        console.log("Setting Up Words");
        console.log(wordArray);

        if (wordArray.length > 4) {
            setWords(wordArray);
        }
    }, [text])

    useEffect(() => {
        let interval;
        if (words.length > 4) {
            interval = setInterval(() => {
                setGameStatus(prevState => {
                    if (prevState.cl < 4) {
                        return { ...prevState, cl: prevState.cl + 1, ip: true };
                    } else {
                        // Game Over
                        clearInterval(interval);
                        setText("Game Over! Paste some text to restart.");

                        return { cl: 0, kl: 0, ip: false };
                    }
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [words]);

    useEffect(() => {
        console.log("GAME STATUS Changed : CL : " + gameStatus.cl)
        console.log(words);
        setWords((prevWords) =>
            prevWords.map((word, i) => {
                if ( i < gameStatus.cl) {
                    if (i === gameStatus.kl) {
                        return { ...word, isVisible: true, isFocused: true };

                    } else {
                        return { ...word, isVisible: true, isFocused: false };
                    }
                } else {
                    console.log("All invisible")
                    return { ...word, isVisible: false, isFocused: false };
                }
            })
        );
    }, [gameStatus])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.pasteButton}
                    onClick={handlePaste}>
                    PASTE YOUR TEXT</button>
                <p>{text}</p>
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
                            <h2>{w.word}</h2>
                            
                        </div>
                    )
                )}
            </div>


            <div style={styles.footer}>
                <h1>Type It Hero!</h1>
            </div>
        </div>
    )

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
        margin: "10px",
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
        background: "red",
        color: "#ffffff",
        padding: "10px",
        border: "none",
        cursor: "pointer",
        fontSize: "2vh",
        fontWeight: "bold"
    },
    wordList: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize:"2vh"
    }
}



export default WordFall;