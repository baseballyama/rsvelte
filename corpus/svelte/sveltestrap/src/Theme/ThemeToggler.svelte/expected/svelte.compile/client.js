import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { colorMode, toggleColorMode } from './helpers';

export default function ThemeToggler($$anchor, $$props) {
	$.push($$props, true);

	const $colorMode = () => $.store_get(colorMode, '$colorMode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let currentColorMode = $colorMode();

	colorMode.subscribe((value) => {
		currentColorMode = value;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get currentColorMode() {
				return currentColorMode;
			},

			get toggleColorMode() {
				return toggleColorMode;
			}
		},
		null
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}