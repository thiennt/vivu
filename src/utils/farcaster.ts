export interface FarcasterUser {
    fid?: number;
    username?: string;
    displayName?: string;
    bio?: string;
    pfpUrl?: string;
    custody?: string;
    verifications?: string[];
}

export interface FarcasterMiniAppContext {
    user?: FarcasterUser;
    isEmbedded: boolean;
    client: 'web' | 'mobile' | 'desktop';
    version?: string;
}

export interface ShareScoreOptions {
    score: number;
    level: number;
    gameStats?: any;
    image?: string;
}

export class FarcasterMiniAppService {
    private static instance: FarcasterMiniAppService;
    private user: FarcasterUser | null = null;
    private isAuthenticated = false;
    private context: FarcasterMiniAppContext;

    private constructor() {
        // Initialize mini app context
        this.context = this.detectMiniAppContext();
        this.initializeMiniApp();
    }

    public static getInstance(): FarcasterMiniAppService {
        if (!FarcasterMiniAppService.instance) {
            FarcasterMiniAppService.instance = new FarcasterMiniAppService();
        }
        return FarcasterMiniAppService.instance;
    }

    private detectMiniAppContext(): FarcasterMiniAppContext {
        const urlParams = new URLSearchParams(window.location.search);
        const isEmbedded = urlParams.has('embedded') || 
                          urlParams.has('frame') || 
                          window.parent !== window ||
                          this.isFarcasterUserAgent();

        const client = this.detectClient();
        
        return {
            isEmbedded,
            client,
            version: urlParams.get('version') || undefined
        };
    }

    private isFarcasterUserAgent(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('farcaster') || 
               userAgent.includes('warpcast') ||
               userAgent.includes('frame');
    }

    private detectClient(): 'web' | 'mobile' | 'desktop' {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad/.test(userAgent)) {
            return 'mobile';
        }
        if (/electron/.test(userAgent)) {
            return 'desktop';
        }
        return 'web';
    }

    private async initializeMiniApp(): Promise<void> {
        try {
            // Hide loading screen after initialization
            setTimeout(() => {
                const loading = document.getElementById('miniapp-loading');
                if (loading) {
                    loading.classList.add('hidden');
                }
            }, 1000);

            // If embedded in Farcaster, try to authenticate automatically
            if (this.context.isEmbedded) {
                console.log('Mini app running in Farcaster context');
                await this.autoAuthenticate();
            }

            // Set up mini app specific optimizations
            this.setupMiniAppOptimizations();
        } catch (error) {
            console.error('Failed to initialize Farcaster mini app:', error);
        }
    }

    private async autoAuthenticate(): Promise<void> {
        try {
            // In a real implementation, this would extract user info from Frame context
            // For now, simulate mini app authentication
            const urlParams = new URLSearchParams(window.location.search);
            const fid = urlParams.get('fid');
            
            if (fid) {
                this.isAuthenticated = true;
                this.user = {
                    fid: parseInt(fid),
                    username: `user${fid}`,
                    displayName: `Farcaster User ${fid}`,
                    bio: 'Playing FarStick mini app',
                    pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=farcaster${fid}`
                };
                this.context.user = this.user;
                console.log('Auto-authenticated user:', this.user);
            }
        } catch (error) {
            console.error('Auto-authentication failed:', error);
        }
    }

    private setupMiniAppOptimizations(): void {
        // Optimize for mobile-first Farcaster experience
        if (this.context.client === 'mobile') {
            // Prevent zoom on touch devices
            document.addEventListener('touchmove', (e: TouchEvent) => {
                if ((e as any).scale !== 1) { e.preventDefault(); }
            }, { passive: false });

            // Optimize touch interactions
            document.addEventListener('touchstart', () => {}, { passive: true });
        }

        // Set up Frame postMessage communication if embedded
        if (this.context.isEmbedded) {
            this.setupFrameCommunication();
        }
    }

    private setupFrameCommunication(): void {
        // Listen for messages from parent Frame
        window.addEventListener('message', (event) => {
            if (event.data.type === 'frame-action') {
                this.handleFrameAction(event.data);
            }
        });

        // Send ready signal to parent Frame
        window.parent.postMessage({
            type: 'miniapp-ready',
            data: { context: this.context }
        }, '*');
    }

    private handleFrameAction(action: any): void {
        console.log('Received Frame action:', action);
        
        switch (action.action) {
            case 'share-score':
                if (action.data) {
                    this.shareScore(action.data);
                }
                break;
            case 'restart-game':
                // Handle game restart
                window.location.reload();
                break;
            default:
                console.log('Unknown Frame action:', action.action);
        }
    }

    public async signIn(): Promise<FarcasterUser | null> {
        try {
            if (this.context.isEmbedded) {
                // In embedded context, user should already be authenticated
                return this.user;
            }

            // For standalone usage, simulate sign-in with better UX
            console.log('Initiating Farcaster sign in for mini app...');
            
            // In a real implementation, this would use Farcaster Auth Kit
            this.isAuthenticated = true;
            this.user = {
                fid: 12345,
                username: 'miniapp_user',
                displayName: 'Mini App Player',
                bio: 'Playing FarStick mini app',
                pfpUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=miniapp'
            };
            
            this.context.user = this.user;
            return this.user;
        } catch (error) {
            console.error('Farcaster mini app sign in failed:', error);
            return null;
        }
    }

    public signOut(): void {
        this.isAuthenticated = false;
        this.user = null;
        this.context.user = undefined;
        console.log('Signed out from Farcaster mini app');
    }

    public getUser(): FarcasterUser | null {
        return this.user;
    }

    public isSignedIn(): boolean {
        return this.isAuthenticated;
    }

    public getMiniAppContext(): FarcasterMiniAppContext {
        return this.context;
    }

    public isFrameContext(): boolean {
        return this.context.isEmbedded;
    }

    public getFrameData(): any {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            frame: urlParams.get('frame'),
            fid: urlParams.get('fid'),
            timestamp: urlParams.get('timestamp'),
            buttonIndex: urlParams.get('buttonIndex'),
            inputText: urlParams.get('inputText'),
            embedded: this.context.isEmbedded,
            client: this.context.client
        };
    }

    public async shareScore(options: ShareScoreOptions): Promise<void> {
        try {
            if (!this.isAuthenticated) {
                console.warn('Cannot share score: user not authenticated');
                return;
            }

            const shareText = `🎮 Just scored ${options.score} points in FarStick! 
            
Reached level ${options.level} in this epic dungeon adventure. Can you beat my score?

Play now: https://vivu-game.vercel.app`;

            if (this.context.isEmbedded) {
                // Send share request to parent Frame
                window.parent.postMessage({
                    type: 'miniapp-share',
                    data: {
                        text: shareText,
                        score: options.score,
                        level: options.level,
                        image: options.image
                    }
                }, '*');
            } else {
                // Fallback to Web Share API or copy to clipboard
                if (navigator.share) {
                    await navigator.share({
                        title: 'FarStick Score',
                        text: shareText,
                        url: 'https://vivu-game.vercel.app'
                    });
                } else {
                    await navigator.clipboard.writeText(shareText);
                    alert('Score copied to clipboard! Share it on Farcaster.');
                }
            }

            console.log('Score shared successfully:', options);
        } catch (error) {
            console.error('Failed to share score:', error);
        }
    }

    public async castToFarcaster(text: string, embeds?: string[]): Promise<void> {
        try {
            if (!this.isAuthenticated) {
                throw new Error('User not authenticated');
            }

            if (this.context.isEmbedded) {
                // Send cast request to parent Frame
                window.parent.postMessage({
                    type: 'miniapp-cast',
                    data: { text, embeds }
                }, '*');
            } else {
                // Fallback implementation
                console.log('Cast would be sent:', { text, embeds });
            }
        } catch (error) {
            console.error('Failed to cast to Farcaster:', error);
            throw error;
        }
    }

    public trackMiniAppEvent(event: string, data?: any): void {
        console.log(`Mini App Event: ${event}`, data);
        
        // Send analytics to parent Frame if embedded
        if (this.context.isEmbedded) {
            window.parent.postMessage({
                type: 'miniapp-analytics',
                data: { event, data, timestamp: Date.now() }
            }, '*');
        }
    }
}

// Export singleton instance
export const farcasterMiniApp = FarcasterMiniAppService.getInstance();

// Legacy export for backward compatibility
export const farcasterService = farcasterMiniApp;