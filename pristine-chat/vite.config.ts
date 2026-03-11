import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/pristine-chat.ts',
            name: 'PristineChat',
            fileName: 'pristine-chat',
            formats: ['es', 'umd'] // ES for modern browsers, UMD for broad compatibility
        },
        rollupOptions: {
            output: {
                // Ensure strictly one file if possible (though css might be separate if not careful with lit)
                // Lit handles styles inside JS, so usually it's fine.
            }
        }
    },
    server: {
        port: 5173
    }
});
