import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { farcasterService, FarcasterUser } from '../utils/farcaster';

export class FarcasterUI extends Container {
    private background!: Graphics;
    private signInButton!: Container;
    private shareButton!: Container;
    private userInfo!: Container;
    private signInText!: Text;
    private shareText!: Text;
    private userText!: Text;
    private isVisible = false;

    constructor() {
        super();
        this.createUI();
        this.updateVisibility();
    }

    private createUI() {
        // Background panel
        this.background = new Graphics();
        this.background.rect(0, 0, 300, 200);
        this.background.fill(0x1e1e2e);
        this.background.stroke({ color: 0x9333ea, width: 2 });
        this.addChild(this.background);

        // Sign In Button
        this.signInButton = new Container();
        const signInBg = new Graphics();
        signInBg.rect(0, 0, 120, 40);
        signInBg.fill(0x9333ea);
        signInBg.stroke({ color: 0x7c3aed, width: 1 });
        this.signInButton.addChild(signInBg);

        this.signInText = new Text({
            text: 'Connect FC',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center'
            })
        });
        this.signInText.anchor.set(0.5);
        this.signInText.x = 60;
        this.signInText.y = 20;
        this.signInButton.addChild(this.signInText);

        this.signInButton.x = 10;
        this.signInButton.y = 10;
        this.signInButton.interactive = true;
        this.signInButton.cursor = 'pointer';
        this.signInButton.on('pointerdown', () => this.handleSignIn());
        this.addChild(this.signInButton);

        // Share Button
        this.shareButton = new Container();
        const shareBg = new Graphics();
        shareBg.rect(0, 0, 120, 40);
        shareBg.fill(0x059669);
        shareBg.stroke({ color: 0x047857, width: 1 });
        this.shareButton.addChild(shareBg);

        this.shareText = new Text({
            text: 'Share Score',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center'
            })
        });
        this.shareText.anchor.set(0.5);
        this.shareText.x = 60;
        this.shareText.y = 20;
        this.shareButton.addChild(this.shareText);

        this.shareButton.x = 140;
        this.shareButton.y = 10;
        this.shareButton.interactive = true;
        this.shareButton.cursor = 'pointer';
        this.shareButton.on('pointerdown', () => this.handleShare());
        this.shareButton.visible = false;
        this.addChild(this.shareButton);

        // User Info
        this.userInfo = new Container();
        this.userText = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 280
            })
        });
        this.userText.x = 10;
        this.userText.y = 60;
        this.userInfo.addChild(this.userText);
        this.userInfo.visible = false;
        this.addChild(this.userInfo);

        // Title
        const title = new Text({
            text: 'Farcaster',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x9333ea,
                fontWeight: 'bold'
            })
        });
        title.x = 10;
        title.y = 160;
        this.addChild(title);

        // Toggle visibility based on frame context
        if (farcasterService.isFrameContext()) {
            this.show();
        }
    }

    private async handleSignIn() {
        try {
            this.signInText.text = 'Connecting...';
            const user = await farcasterService.signIn();
            
            if (user) {
                this.updateUserDisplay(user);
                this.signInButton.visible = false;
                this.shareButton.visible = true;
                this.userInfo.visible = true;
            } else {
                this.signInText.text = 'Connect FC';
                console.log('Farcaster sign in cancelled or failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            this.signInText.text = 'Connect FC';
        }
    }

    private async handleShare() {
        try {
            this.shareText.text = 'Sharing...';
            
            // Get current game score/level from somewhere
            // For now, using placeholder values
            const score = 1000; // Would get this from game state
            const level = 5;    // Would get this from game state
            
            const success = await farcasterService.shareScore(score, level);
            
            if (success) {
                this.shareText.text = 'Shared!';
                setTimeout(() => {
                    this.shareText.text = 'Share Score';
                }, 2000);
            } else {
                this.shareText.text = 'Share Score';
            }
        } catch (error) {
            console.error('Share error:', error);
            this.shareText.text = 'Share Score';
        }
    }

    private updateUserDisplay(user: FarcasterUser) {
        const displayText = `Connected as: ${user.displayName || user.username || 'Unknown'}\nFID: ${user.fid}`;
        this.userText.text = displayText;
    }

    public show() {
        this.isVisible = true;
        this.visible = true;
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
        if (farcasterService.isSignedIn()) {
            const user = farcasterService.getUser();
            if (user) {
                this.updateUserDisplay(user);
                this.signInButton.visible = false;
                this.shareButton.visible = true;
                this.userInfo.visible = true;
            }
        }
    }

    public resize(width: number, height: number) {
        // Position the Farcaster UI in the top-right corner
        this.x = width - 320;
        this.y = 10;
    }
}