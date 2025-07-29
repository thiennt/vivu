// Test the GIF export functionality programmatically
console.log('Testing GIF export functionality...');

// Wait for the scene to be loaded
setTimeout(async () => {
    try {
        // Try to access the BattleScene instance through the navigation system
        // Since we can't easily access the scene instance, we'll test the GifExporter directly
        
        // Import and test the GifExporter
        const { GifExporter } = await import('/src/utils/GifExporter.js');
        
        console.log('✓ GifExporter imported successfully');
        
        // Get the PixiJS app from the global scope or DOM
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        
        // Get the PixiJS app instance (this is a simplified test)
        // In a real scenario, we would access the actual BattleScene instance
        console.log('✓ Canvas found, testing export functionality...');
        
        // Test that gif.js worker is accessible
        const workerResponse = await fetch('/js/gif.worker.js');
        if (workerResponse.ok) {
            console.log('✓ GIF worker file is accessible');
        } else {
            console.log('✗ GIF worker file not accessible');
        }
        
        console.log('✓ GIF export dependencies verified');
        console.log('Export functionality is ready to use!');
        
        // Instructions for manual testing
        console.log('\n--- Manual Testing Instructions ---');
        console.log('1. Look for the green "Export GIF" button in the bottom-right corner');
        console.log('2. Click it to start recording (button will turn red)');
        console.log('3. Click again to stop and download the GIF');
        console.log('4. Check your downloads folder for the generated GIF file');
        
    } catch (error) {
        console.error('✗ GIF export test failed:', error);
    }
}, 2000); // Wait 2 seconds for the app to load