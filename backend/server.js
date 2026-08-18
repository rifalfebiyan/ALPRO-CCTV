const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const HLS_DIR = path.join(__dirname, 'public', 'hls');

// Ensure HLS dir exists
if (!fs.existsSync(HLS_DIR)) {
    fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
    fs.mkdirSync(HLS_DIR, { recursive: true });
}

// Serve static HLS files so Next.js frontend can access them
app.use('/hls', express.static(HLS_DIR));

// Hashmap to track active FFmpeg instances
const activeStreams = {};

/**
 * Endpoint to start RTSP streaming for a Dahua NVR channel
 * 
 * POST /api/stream/start
 * Body: { 
 *   rtsplink: "rtsp://admin:password@10.8.1.100:554/cam/realmonitor?channel=1&subtype=1", 
 *   channel_id: "STORE_1_CH1" 
 * }
 */
app.post('/api/stream/start', (req, res) => {
    const { rtsplink, channel_id } = req.body;

    if (!rtsplink || !channel_id) {
        return res.status(400).json({ error: 'Missing rtsplink or channel_id' });
    }

    const outputDir = path.join(HLS_DIR, channel_id);
    const m3u8Path = path.join(outputDir, 'index.m3u8');

    // If already streaming, just return the existing URL
    if (activeStreams[channel_id]) {
        return res.json({
            channel_id,
            url: `http://localhost:8080/hls/${channel_id}/index.m3u8`,
            status: 'already_running'
        });
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`[Media Server] Starting RTSP -> HLS conversion for ${channel_id}...`);

    // Start FFmpeg process
    // Note: Requires FFmpeg installed on your OS environment via (choco install ffmpeg) or apt-get.
    const command = ffmpeg(rtsplink)
        .addOptions([
            '-c:v copy',             // Sangat Penting: Copy video codec as H.264 without re-encoding to save 99% CPU
            '-c:a aac',              // Convert audio to AAC (Web compatible)
            '-hls_time 2',           // 2 seconds per segment (low latency HLS)
            '-hls_list_size 3',      // Keep only latest 3 segments 
            '-hls_flags delete_segments',
            '-f hls'                 // Output format HLS
        ])
        .output(m3u8Path)
        .on('end', () => {
            console.log(`[Media Server] Stream ended for ${channel_id}`);
            delete activeStreams[channel_id];
        })
        .on('error', (err) => {
            console.error(`[Media Server] FFmpeg Error for ${channel_id}: ${err.message}`);
            delete activeStreams[channel_id];
        });

    command.run();
    activeStreams[channel_id] = command;

    return res.json({
        channel_id,
        url: `http://localhost:8080/hls/${channel_id}/index.m3u8`,
        status: 'starting'
    });
});

app.listen(8080, () => {
    console.log('Media Transcoding Server running on http://localhost:8080');
    console.log('Dahua RTSP Gateway is Ready!');
});
