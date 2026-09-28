import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Store_font($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Applies the store's admin-set body font (store.themeFontFamily, edited on the admin
		 * Theme page) over the active theme's default. 'system' or unset = keep the theme's own
		 * typography. Headings (--font-heading) are intentionally left to the theme.
		 * Set on both :root and the [data-theme] shell so it beats the per-theme font blocks.
		 */
		const STACKS = {
			inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
			roboto: "'Roboto', ui-sans-serif, system-ui, sans-serif",
			poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif"
		};

		const GOOGLE = {
			inter: 'Inter:wght@400;500;600;700',
			roboto: 'Roboto:wght@400;500;700',
			poppins: 'Poppins:wght@400;500;600;700'
		};

		const raw = $.derived(() => String(page.data?.store?.themeFontFamily || '').trim());

		const stack = $.derived(() => {
			if (!raw() || raw().toLowerCase() === 'system') return '';

			const key = raw().toLowerCase();

			if (STACKS[key]) return STACKS[key];

			// Full stacks like "Georgia, serif" are stored verbatim — use as-is.
			return raw();
		});

		const googleHref = $.derived(() => GOOGLE[raw().toLowerCase()]
			? `https://fonts.googleapis.com/css2?family=${GOOGLE[raw().toLowerCase()]}&display=swap`
			: '');

		$.head('rk11uj', $$renderer, ($$renderer) => {
			if (googleHref()) {
				$$renderer.push(`<!--[0--><link rel="stylesheet"${$.attr('href', googleHref())}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});
	});
}