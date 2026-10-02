import * as $ from 'svelte/internal/server';
import { Box, Text, colorScheme, useSvelteUITheme } from '@svelteuidev/core';

export default function ColWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { themeColor } = useSvelteUITheme().fn;

		Box($$renderer, {
			css: {
				boxSizing: 'border-box',
				height: '100%',
				minHeight: 'inherit',
				backgroundColor: $.store_get($$store_subs ??= {}, '$colorScheme', colorScheme) === 'dark' ? themeColor('dark', 4) : themeColor('blue', 0),
				padding: '$mdPX'
			},

			children: ($$renderer) => {
				Text($$renderer, {
					color: $.store_get($$store_subs ??= {}, '$colorScheme', colorScheme) === 'dark' ? 'gray' : 'blue',
					size: 'xl',
					weight: 700,
					align: 'center',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						$.slot($$renderer, $$props, 'default', {}, null);
						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}