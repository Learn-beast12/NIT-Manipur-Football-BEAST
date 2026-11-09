declare const _default: {
    darkMode: ["class"];
    content: string[];
    theme: {
        container: {
            center: true;
            padding: string;
            screens: {
                "2xl": string;
            };
        };
        extend: {
            colors: {
                background: string;
                surface: string;
                elevated: string;
                border: string;
                foreground: string;
                muted: {
                    DEFAULT: string;
                    foreground: string;
                };
                primary: {
                    DEFAULT: string;
                    hover: string;
                    foreground: string;
                };
                gold: string;
                danger: string;
                warning: string;
            };
            borderRadius: {
                lg: string;
                md: string;
                sm: string;
            };
            fontFamily: {
                heading: [string, string, string];
                body: [string, string, string];
            };
            keyframes: {
                "accordion-down": {
                    from: {
                        height: string;
                    };
                    to: {
                        height: string;
                    };
                };
                "accordion-up": {
                    from: {
                        height: string;
                    };
                    to: {
                        height: string;
                    };
                };
            };
            animation: {
                "accordion-down": string;
                "accordion-up": string;
            };
        };
    };
    plugins: {
        handler: () => void;
    }[];
};
export default _default;
