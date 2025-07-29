// Frame API endpoint for Farcaster integration
// This would typically be implemented as a separate API server or serverless function

export interface FrameRequest {
    trustedData: {
        messageBytes: string;
    };
    untrustedData: {
        fid: number;
        url: string;
        messageHash: string;
        timestamp: number;
        network: number;
        buttonIndex: number;
        inputText?: string;
        castId?: {
            fid: number;
            hash: string;
        };
    };
}

export interface FrameResponse {
    image: string;
    buttons?: Array<{
        text: string;
        action?: 'post' | 'post_redirect' | 'link';
        target?: string;
    }>;
    input?: {
        text: string;
    };
    postUrl?: string;
}

export class FrameAPI {
    public static async handleFrameRequest(request: FrameRequest): Promise<FrameResponse> {
        const { buttonIndex, fid, inputText } = request.untrustedData;

        switch (buttonIndex) {
            case 1: // Play Game button
                return {
                    image: this.generateGameImage(),
                    buttons: [
                        { text: '⚔️ Attack', action: 'post' },
                        { text: '🛡️ Defend', action: 'post' },
                        { text: '🎮 Full Game', action: 'link', target: window.location.origin },
                        { text: '📤 Share', action: 'post' }
                    ],
                    postUrl: `${window.location.origin}/api/frame`
                };

            case 2: // Share Score button
                return this.handleShareScore(fid, inputText);

            default:
                return this.getInitialFrame();
        }
    }

    private static getInitialFrame(): FrameResponse {
        return {
            image: this.generateWelcomeImage(),
            buttons: [
                { text: '🎮 Play Game', action: 'post' },
                { text: '📊 Leaderboard', action: 'post' },
                { text: '🌐 Visit Site', action: 'link', target: window.location.origin }
            ],
            postUrl: `${window.location.origin}/api/frame`
        };
    }

    private static async handleShareScore(fid: number, scoreText?: string): Promise<FrameResponse> {
        const score = scoreText ? parseInt(scoreText) || 0 : 0;
        
        // In a real implementation, you'd save the score to a database
        console.log(`User ${fid} scored ${score} points`);

        return {
            image: this.generateScoreShareImage(score),
            buttons: [
                { text: '🎮 Play Again', action: 'post' },
                { text: '📊 Leaderboard', action: 'post' },
                { text: '🌐 Full Game', action: 'link', target: window.location.origin }
            ],
            postUrl: `${window.location.origin}/api/frame`
        };
    }

    private static generateWelcomeImage(): string {
        // In a real implementation, this would generate or return a URL to a dynamic image
        // For now, return a placeholder URL
        return `${window.location.origin}/frame-welcome.png`;
    }

    private static generateGameImage(): string {
        // Generate game state image
        return `${window.location.origin}/frame-game.png`;
    }

    private static generateScoreShareImage(score: number): string {
        // Generate score sharing image
        return `${window.location.origin}/frame-score.png?score=${score}`;
    }
}

// Example usage in a serverless function or API route:
/*
export async function POST(request: Request) {
    try {
        const frameRequest: FrameRequest = await request.json();
        const response = await FrameAPI.handleFrameRequest(frameRequest);
        
        return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Frame API error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
*/