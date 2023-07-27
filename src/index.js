import { getScore } from "./score";
import attenzione from './attenzione-pickpocket.mp3?url';

  
const WIDTH = 200;
const HEIGHT = 150;
const LOOP_TIME = 100;
const GRACE_PERIOD = 1000;

const trackLastScores = GRACE_PERIOD / LOOP_TIME / 2;
const tracking = Array(trackLastScores).fill(0);

let audioPlaying = false;
const trackMovement = (score) => {
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

        const audio = new Audio(attenzione);
        audioPlaying = true;
        audio.play(); 
        audio.onended = () => {
            console.log('STOP')
            audioPlaying = false;
        };
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

        const canvas = document.querySelector('canvas')
        canvas.width = WIDTH
        canvas.height = HEIGHT
        const context = canvas.getContext('2d')

        const loop = async () => {
            context.globalCompositeOperation = 'difference';
            context.drawImage(video, 0, 0, WIDTH, HEIGHT);
            const imageData = context.getImageData(0, 0, WIDTH, HEIGHT);
            const score = getScore(imageData);
            trackMovement(score);
            await sleep();
            
            context.globalCompositeOperation = 'source-over';
            context.drawImage(video, 0, 0, WIDTH, HEIGHT);
            setTimeout(loop, 0);
        }
        loop();
    } catch (error) {
        console.log(error)
    }
}

const main = async () => {
    const button = document.querySelector('button');
    const handleClick = () => {
        button.removeEventListener('click', handleClick);
        startWatching();
        button.innerText = 'Watching... to stop, reload the page';
        button.disabled = true;
        
    }
    button.addEventListener('click', handleClick);
};

main();