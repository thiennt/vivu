import { Application, Container, RenderTexture } from 'pixi.js';
// @ts-ignore - gif.js doesn't have TypeScript definitions
import GIF from 'gif.js';

export interface GifExportOptions {
    width?: number;
    height?: number;
    duration?: number; // Total duration in seconds
    framerate?: number; // Frames per second
    quality?: number; // 1-20 (1 = best, 20 = worst)
    workers?: number; // Number of web workers
}

export class GifExporter {
    private app: Application;
    private gif: any;
    private isRecording: boolean = false;
    private frames: ImageData[] = [];
    private startTime: number = 0;
    private options: Required<GifExportOptions>;

    constructor(app: Application, options: GifExportOptions = {}) {
        this.app = app;
        this.options = {
            width: options.width || 400,
            height: options.height || 300,
            duration: options.duration || 3,
            framerate: options.framerate || 10,
            quality: options.quality || 10,
            workers: options.workers || 2
        };
    }

    /**
     * Start recording frames from a container
     */
    public startRecording(container: Container): void {
        if (this.isRecording) {
            console.warn('Already recording. Stop current recording first.');
            return;
        }

        this.isRecording = true;
        this.frames = [];
        this.startTime = Date.now();

        // Create GIF encoder
        this.gif = new GIF({
            workers: this.options.workers,
            quality: this.options.quality,
            width: this.options.width,
            height: this.options.height,
            workerScript: '/js/gif.worker.js'
        });

        console.log('Started GIF recording...');
        this.recordFrame(container);
    }

    /**
     * Stop recording and generate GIF
     */
    public async stopRecording(): Promise<Blob> {
        if (!this.isRecording) {
            throw new Error('Not currently recording');
        }

        this.isRecording = false;
        console.log(`Stopped recording. Captured ${this.frames.length} frames.`);

        // Add all captured frames to the GIF
        const frameDelay = 1000 / this.options.framerate; // Delay in milliseconds
        this.frames.forEach(frameData => {
            this.gif.addFrame(frameData, { delay: frameDelay });
        });

        // Return promise that resolves when GIF is rendered
        return new Promise((resolve) => {
            this.gif.on('finished', (blob: Blob) => {
                console.log('GIF generation completed');
                resolve(blob);
            });

            this.gif.on('progress', (progress: number) => {
                console.log(`GIF generation progress: ${Math.round(progress * 100)}%`);
            });

            this.gif.render();
        });
    }

    /**
     * Capture a single frame from the container
     */
    private captureFrame(container: Container): ImageData {
        // Create a render texture to capture the container
        const renderTexture = RenderTexture.create({
            width: this.options.width,
            height: this.options.height
        });

        // Render the container to the texture
        this.app.renderer.render(container, { renderTexture });

        // Extract pixel data
        const canvas = this.app.renderer.extract.canvas(renderTexture);
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error('Could not get canvas context');
        }

        const imageData = context.getImageData(0, 0, this.options.width, this.options.height);
        
        // Clean up
        renderTexture.destroy();

        return imageData;
    }

    /**
     * Record frames continuously until stopped or duration reached
     */
    private recordFrame(container: Container): void {
        if (!this.isRecording) return;

        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Stop if we've reached the maximum duration
        if (elapsed >= this.options.duration) {
            console.log(`Reached maximum duration of ${this.options.duration} seconds`);
            return;
        }

        try {
            const frameData = this.captureFrame(container);
            this.frames.push(frameData);

            // Schedule next frame
            const frameInterval = 1000 / this.options.framerate;
            setTimeout(() => this.recordFrame(container), frameInterval);
        } catch (error) {
            console.error('Error capturing frame:', error);
            this.isRecording = false;
        }
    }

    /**
     * Download the generated GIF blob
     */
    public static downloadBlob(blob: Blob, filename: string = 'combat-scene.gif'): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Get current recording status
     */
    public get recording(): boolean {
        return this.isRecording;
    }

    /**
     * Get the number of frames captured so far
     */
    public get frameCount(): number {
        return this.frames.length;
    }
}