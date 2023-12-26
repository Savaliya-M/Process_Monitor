import express from 'express';
const router = express.Router();
import { getProcessStats } from '../Controllers';

router.get('/process/:pid', async (req, res) => {
    const { pid } = req.params;
    const stats = await getProcessStats(parseInt(pid, 10));

    if (stats) {
        res.json(stats);
    } else {
        res.status(404).json({ error: 'Process not found' });
    }
});

export default router;
