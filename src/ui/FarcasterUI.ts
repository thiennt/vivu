import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { farcasterMiniApp, FarcasterUser } from '../utils/farcaster';

export class FarcasterMiniAppUI extends Container {
    private background!: Graphics;
    private signInButton!: Container;
    private shareButton!: Container;
    private castButton!: Container;
    private userInfo!: Container;
    private userText!: Text;
    private statusText!: Text;
    private isVisible = false;
    private gameScore = 0;
    private gameLevel = 1;

    constructor() {
        super();
        this.createUI();
        this.updateVisibility();
    }

    private createUI() {
        const context = farcasterMiniApp.getMiniAppContext();
        
        // Background panel - optimized for mini app
        this.background = new Graphics();
        this.background.rect(0, 0, context.isEmbedded ? 280 : 320, context.isEmbedded ? 180 : 220);
        this.background.fill(0x1a1625);
        this.background.stroke({ color: 0x8B5CF6, width: 2 });
        this.addChild(this.background);

        // Status indicator
        this.statusText = new Text({
            text: context.isEmbedded ? '🎮 Mini App Mode' : '🌐 Standalone Mode',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 10,
                fill: context.isEmbedded ? 0x10B981 : 0x6B7280,
                fontWeight: 'bold'
            })
        });
        this.statusText.x = 10;
        this.statusText.y = context.isEmbedded ? 160 : 200;
        this.addChild(this.statusText);

        // Title
        const title = new Text({
            text: 'FarStick Mini App',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x8B5CF6,
                fontWeight: 'bold'
            })
        });
        title.x = 10;
        title.y = context.isEmbedded ? 140 : 180;
        this.addChild(title);

        this.createButtons();
        this.createUserInfo();
        this.updateVisibility();
    }

    private createButtons() {
        const context = farcasterMiniApp.getMiniAppContext();
        const buttonY = 10;
        
        // Sign In Button
        this.signInButton = this.createButton('Connect FC', 0x8B5CF6, 0x7C3AED);
        this.signInButton.x = 10;
        this.signInButton.y = buttonY;
        this.signInButton.on('pointerdown', () => this.handleSignIn());
        this.addChild(this.signInButton);

        // Share Button
        this.shareButton = this.createButton('Share Score', 0x059669, 0x047857);
        this.shareButton.x = context.isEmbedded ? 100 : 120;
        this.shareButton.y = buttonY;
        this.shareButton.on('pointerdown', () => this.handleShare());
        this.shareButton.visible = false;
        this.addChild(this.shareButton);

        // Cast Button (mini app specific)
        if (context.isEmbedded) {
            this.castButton = this.createButton('Cast Game', 0xF59E0B, 0xD97706);
            this.castButton.x = 190;
            this.castButton.y = buttonY;
            this.castButton.on('pointerdown', () => this.handleCast());
            this.castButton.visible = false;
            this.addChild(this.castButton);
        }

        // Auto-show if in embedded context
        if (context.isEmbedded) {
            this.show();
        }
    }

    private createButton(text: string, bgColor: number, borderColor: number): Container {
        const button = new Container();
        const bg = new Graphics();
        bg.rect(0, 0, 80, 35);
        bg.fill(bgColor);
        bg.stroke({ color: borderColor, width: 1 });
        button.addChild(bg);

        const buttonText = new Text({
            text,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 11,
                fill: 0xffffff,
                align: 'center'
            })
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 40;
        buttonText.y = 17.5;
        button.addChild(buttonText);

        button.interactive = true;
        button.cursor = 'pointer';
        
        // Store text reference for updates
        (button as any).textElement = buttonText;
        
        return button;
    }

    private createUserInfo() {
        // User Info
        this.userInfo = new Container();
        this.userText = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 11,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 260
            })
        });
        this.userText.x = 10;
        this.userText.y = 55;
        this.userInfo.addChild(this.userText);
        this.userInfo.visible = false;
        this.addChild(this.userInfo);
    }

    private async handleSignIn() {
        try {
            const signInText = (this.signInButton as any).textElement;
            signInText.text = 'Connecting...';
            
            const user = await farcasterMiniApp.signIn();
            
            if (user) {
                this.updateUserDisplay(user);
                this.signInButton.visible = false;
                this.shareButton.visible = true;
                if (this.castButton) this.castButton.visible = true;
                this.userInfo.visible = true;
                
                // Track authentication
                farcasterMiniApp.trackMiniAppEvent('user_authenticated', {
                    fid: user.fid,
                    method: 'manual'
                });
            } else {
                signInText.text = 'Connect FC';
                console.log('Farcaster sign in cancelled or failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            const signInText = (this.signInButton as any).textElement;
            signInText.text = 'Connect FC';
        }
    }

    private async handleShare() {
        try {
            const shareText = (this.shareButton as any).textElement;
            shareText.text = 'Sharing...';
            
            await farcasterMiniApp.shareScore({
                score: this.gameScore,
                level: this.gameLevel,
                gameStats: {
                    playtime: Date.now(), // Would track actual playtime
                    achievements: [] // Would include achievements
                }
            });
            
            shareText.text = 'Shared!';
            setTimeout(() => {
                shareText.text = 'Share Score';
            }, 2000);

            // Track share event
            farcasterMiniApp.trackMiniAppEvent('score_shared', {
                score: this.gameScore,
                level: this.gameLevel
            });
        } catch (error) {
            console.error('Share error:', error);
            const shareText = (this.shareButton as any).textElement;
            shareText.text = 'Share Score';
        }
    }

    private async handleCast() {
        try {
            const castText = (this.castButton as any).textElement;
            castText.text = 'Casting...';
            
            const castMessage = `🎮 Playing FarStick mini app! 
            
Current score: ${this.gameScore} | Level: ${this.gameLevel}

Join me in this epic dungeon adventure!`;

            await farcasterMiniApp.castToFarcaster(castMessage, ['https://vivu-game.vercel.app']);
            
            castText.text = 'Cast Sent!';
            setTimeout(() => {
                castText.text = 'Cast Game';
            }, 2000);

            // Track cast event
            farcasterMiniApp.trackMiniAppEvent('game_cast', {
                score: this.gameScore,
                level: this.gameLevel
            });
        } catch (error) {
            console.error('Cast error:', error);
            const castText = (this.castButton as any).textElement;
            castText.text = 'Cast Game';
        }
    }

    private updateUserDisplay(user: FarcasterUser) {
        const context = farcasterMiniApp.getMiniAppContext();
        const displayText = `🟢 ${user.displayName || user.username || 'Anonymous'}
FID: ${user.fid} | ${context.isEmbedded ? 'Mini App' : 'Standalone'}
Score: ${this.gameScore} | Level: ${this.gameLevel}`;
        this.userText.text = displayText;
    }

    public updateGameStats(score: number, level: number) {
        this.gameScore = score;
        this.gameLevel = level;
        
        // Update user display if signed in
        if (farcasterMiniApp.isSignedIn()) {
            const user = farcasterMiniApp.getUser();
            if (user) {
                this.updateUserDisplay(user);
            }
        }
    }

    public show() {
        this.isVisible = true;
        this.visible = true;
        
        // Track UI show
        farcasterMiniApp.trackMiniAppEvent('ui_shown', {
            context: farcasterMiniApp.getMiniAppContext()
        });
    }

    public hide() {
        this.isVisible = false;
        this.visible = false;
    }

    public toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    private updateVisibility() {
        // Check if user is already signed in
        if (farcasterMiniApp.isSignedIn()) {
            const user = farcasterMiniApp.getUser();
            if (user) {
                this.updateUserDisplay(user);
                this.signInButton.visible = false;
                this.shareButton.visible = true;
                if (this.castButton) this.castButton.visible = true;
                this.userInfo.visible = true;
            }
        }
    }

    public resize(width: number, height: number) {
        const context = farcasterMiniApp.getMiniAppContext();
        
        // Position optimized for mini app context
        if (context.isEmbedded) {
            // In embedded mode, position more compactly
            this.x = Math.max(10, width - 300);
            this.y = 10;
        } else {
            // In standalone mode, position in top-right
            this.x = width - 340;
            this.y = 10;
        }
    }
}

// Backward compatibility export
export const FarcasterUI = FarcasterMiniAppUI;