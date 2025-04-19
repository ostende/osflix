// Example: build.js or similar esbuild config file

const esbuild = require('esbuild');
const { polyfillNode } = require('esbuild-plugin-polyfill-node');

esbuild.build({
    entryPoints: ['src/index.tsx'], // Your main entry point
    bundle: true,
    outfile: 'dist/bundle.js', // Your output file
    format: 'esm', // Or 'iife', depending on how you load the script
    sourcemap: true, // Optional: for debugging

    // --- Crucial settings for webtorrent in browser ---
    platform: 'browser', // Target the browser environment
    mainFields: ['browser', 'module', 'main'], // Prioritize browser-specific code in packages
    define: {
        // Define environment variables (React often needs this)
        'process.env.NODE_ENV': '"development"', // or 'production' for prod builds
        // Make 'global' available if needed by dependencies
        'global': 'window'
    },
    plugins: [
        polyfillNode({
            // Options (optional): specify specific polyfills if needed
            // e.g., globals: { buffer: true, process: true }
        }),
    ],
    // --- End crucial settings ---

    loader: { // Configure loaders for different file types if needed
        '.js': 'jsx',
        '.ts': 'tsx',
         // Add loaders for CSS, images, etc. if you import them
    },

}).catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
});