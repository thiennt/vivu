export interface FarcasterUser {
    fid?: number;
    username?: string;
    displayName?: string;
    bio?: string;
    pfpUrl?: string;
    custody?: string;
    verifications?: string[];
}

export class FarcasterService {
    private static instance: FarcasterService;
    private user: FarcasterUser | null = null;
    private isAuthenticated = false;

    private constructor() {
        // Initialize service
    }

    public static getInstance(): FarcasterService {
        if (!FarcasterService.instance) {
            FarcasterService.instance = new FarcasterService();
        }
        return FarcasterService.instance;
    }

    public async signIn(): Promise<FarcasterUser | null> {
        try {
            // For now, simulate authentication process
            // In a real implementation, this would use the Farcaster Auth Kit
            console.log('Simulating Farcaster sign in...');
            
            // Simulate successful login
            this.isAuthenticated = true;
            this.user = {
                fid: 12345,
                username: 'testuser',
                displayName: 'Test User',
                bio: 'Game player',
                pfpUrl: 'https://example.com/avatar.png'
            };
            
            return this.user;
        } catch (error) {
            console.error('Farcaster sign in failed:', error);
            return null;
        }
    }

    public signOut(): void {
        this.isAuthenticated = false;
        this.user = null;
    }

    public getUser(): FarcasterUser | null {
        return this.user;
    }

    public isSignedIn(): boolean {
        return this.isAuthenticated && this.user !== null;
    }

    // Share game score to Farcaster
    public async shareScore(score: number, level: number): Promise<boolean> {
        if (!this.isSignedIn()) {
            console.warn('User not signed in to Farcaster');
            return false;
        }

        try {
            const text = `Just scored ${score} points at level ${level} in FarStick! 🎮⚔️\n\nPlay now: ${window.location.origin}`;
            
            // This would typically call a Farcaster cast API
            console.log('Would share to Farcaster:', text);
            
            // For now, we'll just log the action
            // In a real implementation, you'd call the Farcaster API to create a cast
            return true;
        } catch (error) {
            console.error('Failed to share score:', error);
            return false;
        }
    }

    // Check if running in Farcaster Frame context
    public isFrameContext(): boolean {
        // Check for Farcaster Frame user agent or referrer
        const userAgent = navigator.userAgent.toLowerCase();
        const referrer = document.referrer.toLowerCase();
        
        return userAgent.includes('farcaster') || 
               referrer.includes('warpcast') || 
               referrer.includes('farcaster') ||
               window.location.search.includes('frame=true');
    }

    // Get Frame-specific data
    public getFrameData(): any {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            frameButton: urlParams.get('frameButton'),
            frameAction: urlParams.get('frameAction'),
            frameData: urlParams.get('frameData'),
        };
    }
}

export const farcasterService = FarcasterService.getInstance();