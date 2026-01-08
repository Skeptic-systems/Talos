import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

const STORAGE_KEY = "talos-theme";
const DEFAULT_THEME: Theme = "dark";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
	if (typeof window === "undefined") {
		return DEFAULT_THEME;
	}

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") {
		return stored;
	}

	return DEFAULT_THEME;
}

function applyTheme(theme: Theme): void {
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
}

type ThemeProviderProps = {
	children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const storedTheme = getStoredTheme();
		setThemeState(storedTheme);
		applyTheme(storedTheme);
		setMounted(true);
	}, []);

	const setTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
		applyTheme(newTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	}, [theme, setTheme]);

	if (!mounted) {
		return null;
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
