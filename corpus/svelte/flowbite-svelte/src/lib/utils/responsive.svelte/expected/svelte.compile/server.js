import * as $ from 'svelte/internal/server';

export function useMediaQuery(query) {
	let matches = false;

	return () => matches;
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
	let currentBreakpoint = "xs";

	return () => currentBreakpoint;
}

// Type definitions for common breakpoint values
export const BREAKPOINTS = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

export default function Responsive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}