import { getScore } from "./score";
import attenzione from './attenzione-pickpocket.mp3?url';

  
const WIDTH = 200;
const HEIGHT = 150;
const LOOP_TIME = 1000;
const GRACE_PERIOD = 10000;

const trackLastScores = GRACE_PERIOD / LOOP_TIME / 2;
const tracking = Array(trackLastScores).fill(0);

let audioPlaying = false;

let audioSingleton;
const playAudio = async (onEnd = () => {}, silent = false) => {
    try {
        // working around iOS 
        if (!audioSingleton) {
            audioSingleton = new Audio();
        }
        if (silent) {
            // https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari
            audioSingleton.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        } else {
            audioSingleton.src = attenzione;
        }
        
        await audioSingleton.play();
        audioSingleton.onended = () => {
            onEnd();
        };
    } catch (error) {
        console.error('Audio error', error);
    }
}
const trackMovement = async (score) => {
    tracking.shift();
    tracking.push(score);

    let hasAllAboveThreshold = true;
    console.log(JSON.stringify(tracking));
    for (const scoreItem of tracking) {
        if (scoreItem < 5) {
            hasAllAboveThreshold = false;
            break;
        }
    }


    if (hasAllAboveThreshold) {
        console.warn('ALERTA!!!');
        if (audioPlaying) {
            return;
        }

        try {
            audioPlaying = true;
            console.log('play audio')
            await playAudio(() => {
                console.log('STOP');
                audioPlaying = false;
            })
        } catch (audioError) {
            console.error('Audio error', audioError);
        }
    }
};

const startWatching = async () => {
    const sleep = () => new Promise(resolve => setTimeout(resolve, LOOP_TIME));
    try {
        const settings = {
            audio: false,
            video: { width: WIDTH, height: HEIGHT }
        }
    
        const stream = await navigator.mediaDevices.getUserMedia(settings);
        const video = document.querySelector('video')
        video.srcObject = stream
        video.playsInline = true;

        const canvas = document.querySelector('canvas')
        canvas.width = WIDTH
        canvas.height = HEIGHT
        const context = canvas.getContext('2d')

        const loop = async () => {
            console.log(context, context.setCompositeOperation);
            if (context.setCompositeOperation) {
                context.setCompositeOperation('xor');
            } else {
                // context.globalCompositeOperation = 'difference';
            }
            context.drawImage(video, 0, 0, WIDTH, HEIGHT);
            const imageData = context.getImageData(0, 0, WIDTH, HEIGHT);
            // const score = getScore(imageData);
            // await trackMovement(score);
            await sleep();
            
            // context.globalCompositeOperation = 'source-over';
            // context.drawImage(video, 0, 0, WIDTH, HEIGHT);
            setTimeout(loop, 0);
        }
        loop();
    } catch (error) {
        console.log(error)
    }
}

const enableAudio = () => new Promise((resolve) => {
    playAudio(() => {
        resolve();
    }, true);
});
const main = async () => {
    const button = document.querySelector('button');
    const handleClick = async () => {
        button.removeEventListener('click', handleClick);
        await enableAudio();
        startWatching();
        button.innerText = 'Watching... to stop, reload the page';
        button.disabled = true;
        
    }
    button.addEventListener('click', handleClick);
};

main();