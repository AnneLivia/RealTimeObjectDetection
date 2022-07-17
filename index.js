
// Para executar o códigos javascript após o html ser carregado
document.addEventListener("DOMContentLoaded", async () => {

    // Obtendo os elementos de video e canvas
    const video = document.querySelector('#videoElement');
    const canvas = document.querySelector('#videoCanvas');

    const label = document.querySelector("#label");
    const confidence = document.querySelector("#confidence");

    const width = 600;
    const height = 440;

    if (!canvas.getContext) {
        return console.error("Canvas is not supported");
    }

    const ctx = canvas.getContext('2d');

    // se suportado pelo browser, colocar a webcam para funcionar
    if (navigator.mediaDevices.getUserMedia) {
        try {
            // o src do vídeo receberá o stream da webcam
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
        } catch (err) {
            console.log(err.message);
        }
    }

    // criando o metodo para detecção que ao carregar o modelo, irá chamada a função detect
    const objectDetector = await ml5.objectDetector('cocossd', () => {
        console.log('Modelo carregado!');
        detect();
    });

    // desenhando os retangulos no vídeo usando canvas
    const drawRect = (objects) => {

        // Clear part of the canvas
        // ctx.fillStyle = "#00000";

        // para especificar o tamanho do canvas, porque o contexto e o canvas estavam
        // de tamanhos diferentes
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(video, 0, 0);

        for (let i = 0; i < objects.length; i += 1) {

            // só desenhar se confiança acima de 60
            if (objects[i].confidence > 0.60) { 
                ctx.font = "20px Arial";
                ctx.fillStyle = "blue";
                ctx.fillText(objects[i].label, objects[i].x + 4, objects[i].y + 16);
                
                ctx.beginPath();
                ctx.rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.closePath();

                // mostrando na tela o label e a confiança
                label.innerHTML = `O que foi encontrado: <span>${objects[i].label}</span>`;
                confidence.innerHTML = `Confiança: <span>${Math.round(objects[i].confidence * 100)}%</span>`;
            }
        }
    };

    // Quando o modelo carregar, iniciar detecção dos objetos
    const detect = () => {
        // detectar os objetos presentes no vídeo
        objectDetector.detect(video, (err, results) => {

            if (err) {
                console.error(err.message);
                return;
            }

            // se houver detecção, começar a desenhar os retangulos
            if (results) {
                drawRect(results);
            }

            console.log(results); // Will output bounding boxes of detected objects
            // para detectar em tempo real várias vezes
            detect();
        });

        console.log('ml5 version:', ml5.version);
    };
});