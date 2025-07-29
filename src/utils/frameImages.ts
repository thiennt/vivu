export class FrameImageGenerator {
    private static canvas: HTMLCanvasElement | null = null;
    private static ctx: CanvasRenderingContext2D | null = null;

    private static getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1200;
            this.canvas.height = 630; // Standard Frame image dimensions
            this.ctx = this.canvas.getContext('2d')!;
        }
        return { canvas: this.canvas, ctx: this.ctx! };
    }

    public static generateWelcomeImage(): string {
        const { canvas, ctx } = this.getCanvas();

        // Clear canvas
        ctx.fillStyle = '#1e1e2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#9333ea');
        gradient.addColorStop(1, '#1e1e2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FarStick', canvas.width / 2, 200);

        // Add subtitle
        ctx.font = '36px Arial';
        ctx.fillText('Epic Dungeon Adventure', canvas.width / 2, 280);

        // Add call to action
        ctx.font = '28px Arial';
        ctx.fillStyle = '#a855f7';
        ctx.fillText('Play now on Farcaster!', canvas.width / 2, 400);

        // Add decorative elements
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(200, 150, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(1000, 150, 50, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL();
    }

    public static generateGameImage(score: number = 0, level: number = 1): string {
        const { canvas, ctx } = this.getCanvas();

        // Clear canvas with game background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add game UI background
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FarStick Battle', canvas.width / 2, 100);

        // Add score
        ctx.font = '32px Arial';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 200);

        // Add level
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(`Level: ${level}`, canvas.width / 2, 250);

        // Add game elements (simplified)
        // Player character
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(200, 350, 80, 120);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(210, 360, 60, 40); // Head

        // Enemy character
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(920, 350, 80, 120);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(930, 360, 60, 40); // Head

        // Add action prompt
        ctx.fillStyle = '#a855f7';
        ctx.font = '28px Arial';
        ctx.fillText('Choose your action!', canvas.width / 2, 550);

        return canvas.toDataURL();
    }

    public static generateScoreImage(score: number, isHighScore: boolean = false): string {
        const { canvas, ctx } = this.getCanvas();

        // Clear canvas
        const bgColor = isHighScore ? '#059669' : '#1e1e2e';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add celebration background for high scores
        if (isHighScore) {
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#059669');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        const title = isHighScore ? 'New High Score!' : 'Game Over';
        ctx.fillText(title, canvas.width / 2, 180);

        // Add score
        ctx.font = 'bold 96px Arial';
        ctx.fillStyle = isHighScore ? '#fef3c7' : '#10b981';
        ctx.fillText(score.toString(), canvas.width / 2, 320);

        // Add subtitle
        ctx.font = '36px Arial';
        ctx.fillStyle = '#d1d5db';
        ctx.fillText('Points Earned', canvas.width / 2, 380);

        // Add call to action
        ctx.font = '28px Arial';
        ctx.fillStyle = '#a855f7';
        ctx.fillText('Share your achievement!', canvas.width / 2, 500);

        return canvas.toDataURL();
    }

    // Generate and save frame images to public folder (for production use)
    public static async generateAndSaveImages() {
        try {
            // This would typically be done server-side or in a build process
            const welcomeImage = this.generateWelcomeImage();
            const gameImage = this.generateGameImage(1000, 5);
            const scoreImage = this.generateScoreImage(2500, true);

            // In a real implementation, you'd save these to your public folder or CDN
            console.log('Generated frame images:', {
                welcome: welcomeImage.length,
                game: gameImage.length,
                score: scoreImage.length
            });

            return {
                welcome: welcomeImage,
                game: gameImage,
                score: scoreImage
            };
        } catch (error) {
            console.error('Error generating frame images:', error);
            return null;
        }
    }
}