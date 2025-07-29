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
        ctx.fillStyle = '#1a1625';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add gradient background for mini app
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(0.5, '#667eea');
        gradient.addColorStop(1, '#1a1625');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add mini app badge
        ctx.fillStyle = '#10B981';
        ctx.fillRect(50, 50, 200, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 MINI APP', 70, 90);

        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 84px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FarStick', canvas.width / 2, 220);

        // Add subtitle
        ctx.font = '42px Arial';
        ctx.fillText('Farcaster Mini App Game', canvas.width / 2, 300);

        // Add description
        ctx.font = '32px Arial';
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText('Epic dungeon adventure built for Farcaster', canvas.width / 2, 380);

        // Add call to action
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText('🚀 Play Now in Farcaster!', canvas.width / 2, 480);

        // Add decorative game elements
        this.drawGameIcon(ctx, 150, 400, 60);
        this.drawGameIcon(ctx, canvas.width - 150, 400, 60);

        return canvas.toDataURL('image/png');
    }

    private static drawGameIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
        // Draw sword icon
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(x - size/6, y - size/2, size/3, size);
        ctx.fillRect(x - size/3, y - size/3, size*2/3, size/6);
    }

    public static generateGameImage(score: number = 0, level: number = 1): string {
        const { canvas, ctx } = this.getCanvas();

        // Clear canvas with mini app game background
        ctx.fillStyle = '#0f0a19';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add mini app game UI background
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
        gradient.addColorStop(0, '#1e1b4b');
        gradient.addColorStop(1, '#0f0a19');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add mini app indicator
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(20, 20, 180, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 Mini App', 30, 50);

        // Add title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FarStick in Action!', canvas.width / 2, 120);

        // Add score with enhanced styling
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = '#10B981';
        ctx.fillText(`💎 Score: ${score}`, canvas.width / 2, 220);

        // Add level with enhanced styling  
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText(`⚔️ Level: ${level}`, canvas.width / 2, 280);

        // Add mini app specific message
        ctx.font = '32px Arial';
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText('Playing in Farcaster ecosystem', canvas.width / 2, 350);

        // Add call to action
        ctx.font = 'bold 38px Arial';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText('🚀 Join the adventure!', canvas.width / 2, 450);

        // Add game character representations
        this.drawPlayer(ctx, 300, 500);
        this.drawEnemy(ctx, 900, 500);

        return canvas.toDataURL('image/png');
    }

    private static drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
        // Player character (blue/cyan)
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x - 40, y - 60, 80, 120);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - 30, y - 50, 60, 40); // Head
        
        // Weapon
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(x + 50, y - 40, 10, 80);
    }

    private static drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number) {
        // Enemy character (red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - 40, y - 60, 80, 120);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - 30, y - 50, 60, 40); // Head
    }

    public static generateScoreImage(score: number, isHighScore: boolean = false): string {
        const { canvas, ctx } = this.getCanvas();

        // Clear canvas with mini app celebration theme
        const bgColor = isHighScore ? '#059669' : '#1a1625';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add celebration background for high scores
        if (isHighScore) {
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
            gradient.addColorStop(0, '#10B981');
            gradient.addColorStop(1, '#059669');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Add mini app badge
        ctx.fillStyle = isHighScore ? '#FBBF24' : '#8B5CF6';
        ctx.fillRect(50, 50, 220, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 FarStick Mini App', 70, 90);

        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        const title = isHighScore ? '🏆 New High Score!' : '💀 Game Over';
        ctx.fillText(title, canvas.width / 2, 200);

        // Add score with prominent display
        ctx.font = 'bold 112px Arial';
        ctx.fillStyle = isHighScore ? '#FBBF24' : '#10B981';
        ctx.fillText(score.toString(), canvas.width / 2, 340);

        // Add subtitle
        ctx.font = '42px Arial';
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText('Points in Farcaster Mini App', canvas.width / 2, 400);

        // Add sharing prompt
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText('📢 Share your achievement on Farcaster!', canvas.width / 2, 500);

        // Add mini game icons
        this.drawGameIcon(ctx, 200, 520, 40);
        this.drawGameIcon(ctx, 1000, 520, 40);

        return canvas.toDataURL('image/png');
    }

    // Generate and save frame images optimized for mini app (for production use)
    public static async generateAndSaveImages() {
        try {
            // Generate mini app optimized frame images
            const welcomeImage = this.generateWelcomeImage();
            const gameImage = this.generateGameImage(1000, 5);
            const scoreImage = this.generateScoreImage(2500, true);

            // In a real implementation, you'd save these to your public folder or CDN
            console.log('Generated Farcaster mini app frame images:', {
                welcome: `${Math.round(welcomeImage.length / 1024)}KB`,
                game: `${Math.round(gameImage.length / 1024)}KB`,
                score: `${Math.round(scoreImage.length / 1024)}KB`
            });

            // For development, you could save to localStorage or display them
            if (typeof window !== 'undefined') {
                localStorage.setItem('farstick-frame-welcome', welcomeImage);
                localStorage.setItem('farstick-frame-game', gameImage);
                localStorage.setItem('farstick-frame-score', scoreImage);
            }

            return {
                welcome: welcomeImage,
                game: gameImage,
                score: scoreImage
            };
        } catch (error) {
            console.error('Error generating mini app frame images:', error);
            return null;
        }
    }
}