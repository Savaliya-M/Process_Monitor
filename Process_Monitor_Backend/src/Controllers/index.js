import { Server } from 'socket.io';
import pidusage from 'pidusage';

function setupSocketIo(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
}

async function getProcessStats(pid) {
    try {
        const stats = await pidusage(pid);
        return stats;
    } catch (error) {
        console.error(`Error fetching stats for PID ${pid}:`, error);
        return null;
    }
}

export { setupSocketIo, getProcessStats };
