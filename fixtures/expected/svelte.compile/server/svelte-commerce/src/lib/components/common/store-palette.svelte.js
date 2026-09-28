import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Store_palette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Applies the store's admin-set palette (store.cssVariables, edited on the admin Theme
		 * page) on the [data-theme] shell for the DEFAULT theme. The core ColorPalette component
		 * injects these at :root, but the per-theme app.css blocks (e.g. [data-theme='default'])
		 * define the same tokens on the shell and shadow it — inline styles on the shell win.
		 * Reskinned themes keep their baked palettes (reskin pipeline owns those).
		 */
		const activeTheme = $.derived(() => page.data?.theme?.name ?? 'default');

		const vars = $.derived(() => page.data?.store?.cssVariables ?? {});
		// Same shadcn-raw transform the core ColorPalette uses: "hsl(24, 100%, 50%)" → "24 100% 50%"
	});
}