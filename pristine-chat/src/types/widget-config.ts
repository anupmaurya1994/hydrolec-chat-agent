export interface WidgetFeatures {
    enableFileUpload: boolean;
    allowedFileTypes: string[];
    maxFileSizeMB: number;
    enableEmoji: boolean;
    enableMarkdown: boolean;
    enableStreaming: boolean;
    enableFeedback: boolean;
    enableConversationReset: boolean;
}

export interface WidgetUiConfig {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    fontFamily: string;
    position: 'bottom-right' | 'bottom-left' | 'inline';
    zIndex: string;
    launcherIcon: string;
    headerTitle: string;
    headerSubtitle: string;
    welcomeMessage: string;
    typingIndicator: boolean;
    typingText?: string;
    autoOpenDelay?: number;
    width?:number;
    launcherText?:string;
    sessionTimeout?:any
}

export interface WidgetConfig extends WidgetUiConfig {
    apiBaseUrl: string;
    apiKey?: string;
    userId?: string;
    tenantId?: string;
    features: WidgetFeatures;
}
