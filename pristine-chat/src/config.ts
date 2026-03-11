import { WidgetConfig } from './types/widget-config';

export const defaultConfig: WidgetConfig = {
    apiBaseUrl: 'http://localhost:3000/api/hydrolecagentKim',
    theme: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
    position: 'bottom-right',
    zIndex: '9999',
    launcherIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    headerTitle: 'Support',
    headerSubtitle: 'We are online',
    welcomeMessage: 'Hello! How can I help you?',
    typingIndicator: true,
    typingText: 'Agent is typing...',
    features: {
        enableFileUpload: false,
        allowedFileTypes: ['jpg', 'png', 'pdf'],
        maxFileSizeMB: 5,
        enableEmoji: true,
        enableMarkdown: true,
        enableStreaming: true,
        enableFeedback: false,
        enableConversationReset: true
    }
};

export function mergeConfig(
    defaults: WidgetConfig,
    backendConfig: Partial<WidgetConfig> = {},
    userConfig: Partial<WidgetConfig> = {}
): WidgetConfig {
    return {
        ...defaults,
        ...backendConfig,
        ...userConfig,
        features: {
            ...defaults.features,
            ...(backendConfig.features || {}),
            ...(userConfig.features || {})
        }
    };
}
