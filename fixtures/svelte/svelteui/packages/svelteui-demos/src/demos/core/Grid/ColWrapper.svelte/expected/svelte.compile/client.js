import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Text, colorScheme, useSvelteUITheme } from '@svelteuidev/core';

export default function ColWrapper($$anchor, $$props) {
	$.push($$props, true);

	const $colorScheme = () => $.store_get(colorScheme, '$colorScheme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { themeColor } = useSvelteUITheme().fn;

	{
		let $0 = $.derived(() => ({
			boxSizing: 'border-box',
			height: '100%',
			minHeight: 'inherit',
			backgroundColor: $colorScheme() === 'dark' ? themeColor('dark', 4) : themeColor('blue', 0),
			padding: '$mdPX'
		}));

		Box($$anchor, {
			get css() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $colorScheme() === 'dark' ? 'gray' : 'blue');

					Text($$anchor, {
						get color() {
							return $.get($0);
						},
						size: 'xl',
						weight: 700,
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node = $.first_child(fragment_2);

							$.slot(node, $$props, 'default', {}, null);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}