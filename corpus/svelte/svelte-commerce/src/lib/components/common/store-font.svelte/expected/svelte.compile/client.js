import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<link rel="stylesheet"/>`);

export default function Store_font($$anchor, $$props) {
	$.push($$props, true);

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
		if (!$.get(raw) || $.get(raw).toLowerCase() === 'system') return '';

		const key = $.get(raw).toLowerCase();

		if (STACKS[key]) return STACKS[key];

		// Full stacks like "Georgia, serif" are stored verbatim — use as-is.
		return $.get(raw);
	});

	const googleHref = $.derived(() => GOOGLE[$.get(raw).toLowerCase()]
		? `https://fonts.googleapis.com/css2?family=${GOOGLE[$.get(raw).toLowerCase()]}&display=swap`
		: '');

	$.user_effect(() => {
		const targets = [
			document.documentElement,
			document.querySelector('[data-theme]')
		].filter(Boolean);

		for (const el of targets) {
			if ($.get(stack)) {
				el.style.setProperty('--font-body', $.get(stack));
				el.style.setProperty('--font-primary', $.get(stack));
			} else {
				el.style.removeProperty('--font-body');
				el.style.removeProperty('--font-primary');
			}
		}
	});

	$.head('rk11uj', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var link = root();

				$.template_effect(() => $.set_attribute(link, 'href', $.get(googleHref)));
				$.append($$anchor, link);
			};

			$.if(node, ($$render) => {
				if ($.get(googleHref)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.pop();
}