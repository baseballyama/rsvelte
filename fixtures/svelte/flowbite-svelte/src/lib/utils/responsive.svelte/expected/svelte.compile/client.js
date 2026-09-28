import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export function useMediaQuery(query) {
	let matches = $.state(false);

	$.user_effect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia(query);

		$.set(matches, mediaQuery.matches, true);

		const handler = (e) => {
			$.set(matches, e.matches, true);
		};

		mediaQuery.addEventListener("change", handler);

		return () => {
			mediaQuery.removeEventListener("change", handler);
		};
	});

	return () => $.get(matches);
}

/**
 * Hook for common Tailwind CSS breakpoints
 * @returns Object with boolean values for each breakpoint
 */
export function useBreakpoints() {
	const sm = useMediaQuery("(min-width: 640px)");
	const md = useMediaQuery("(min-width: 768px)");
	const lg = useMediaQuery("(min-width: 1024px)");
	const xl = useMediaQuery("(min-width: 1280px)");
	const xxl = useMediaQuery("(min-width: 1536px)");

	return {
		get sm() {
			return sm();
		},

		get md() {
			return md();
		},

		get lg() {
			return lg();
		},

		get xl() {
			return xl();
		},

		get "2xl"() {
			return xxl();
		},

		get isMobile() {
			return !sm();
		},

		get isTablet() {
			return sm() && !lg();
		},

		get isDesktop() {
			return lg();
		}
	};
}

/**
 * Get current breakpoint name
 * @returns Current breakpoint as string
 */
export function useCurrentBreakpoint() {
	let currentBreakpoint = $.state("xs");

	$.user_effect(() => {
		if (typeof window === "undefined") return;

		const updateBreakpoint = () => {
			const width = window.innerWidth;

			if (width >= 1536) $.set(currentBreakpoint, "2xl"); else if (width >= 1280) $.set(currentBreakpoint, "xl"); else if (width >= 1024) $.set(currentBreakpoint, "lg"); else if (width >= 768) $.set(currentBreakpoint, "md"); else if (width >= 640) $.set(currentBreakpoint, "sm"); else $.set(currentBreakpoint, "xs");
		};

		updateBreakpoint();
		window.addEventListener("resize", updateBreakpoint);

		return () => {
			window.removeEventListener("resize", updateBreakpoint);
		};
	});

	return () => $.get(currentBreakpoint);
}

// Type definitions for common breakpoint values
export const BREAKPOINTS = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

export default function Responsive($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}