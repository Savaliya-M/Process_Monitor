import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import pidusage from 'pidusage';
import psList from 'ps-list';
import pkg from 'detect-gpu';
const { getGPUTier } = pkg;
import si from 'systeminformation'



const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
app.use(cors());

async function getProcessDetails(pid) {
    return new Promise((resolve, reject) => {
        pidusage(pid, (err, stats) => {
            if (err) {
                if (err.message === 'No matching pid found') {
                    resolve(null);
                } else {
                    reject(err);
                }
            } else {
                resolve(stats);
            }
        });
    });
}

async function getAllProcesses() {
    try {
        const processes = await psList();
        const detailedProcesses = await Promise.all(
            processes.map(async (process) => {
                const details = await getProcessDetails(process.pid);
                return { ...process, details };
            })
        );

        const filteredProcesses = detailedProcesses.filter(
            (process) => process.details && process.details.memory > 0
        );

        return filteredProcesses;
    } catch (error) {
        console.error('Error fetching process list:', error.message);
        return [];
    }
}


io.on('connection', async (socket) => {
    console.log('Client connected');
    const gpuTier = await getGPUTier();
    console.log(gpuTier, "GPU");

    si.graphics()
        .then(data => {
            console.log('GPU Information:', data);
        })
        .catch(error => {
            console.error('Error fetching GPU information:', error);
        });



    setInterval(async () => {
        try {
            const processes = await getAllProcesses();
            socket.emit('processes', { list: processes });
        } catch (error) {
            console.error('Error fetching process list:', error.message);
        }
    }, 3000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
