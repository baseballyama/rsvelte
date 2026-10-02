import 'svelte/internal/disclose-version';
import Styles from './Styles.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';

import {
	Button,
	Icon,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	ThemeToggler,
	colorMode,
	toggleColorMode,
	useColorMode
} from '@sveltestrap/sveltestrap';

export const meta = { title: 'Stories/Styles', component: Styles };

var root = $.from_html(`Nice! <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`light <!>`, 1);
var root_3 = $.from_html(`dark <!>`, 1);
var root_4 = $.from_html(`auto <!>`, 1);
var root_5 = $.from_html(`<!> <div class="horizontal style-example"><!> <!> <!> <!></div>`, 1);

export default function Styles_stories($$anchor) {
	const $colorMode = () => $.store_get(colorMode, '$colorMode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let theme = $colorMode();
	var fragment = root_1();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Styles(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_3 = $.sibling($.first_child(fragment_2));

					Icon(node_3, { name: 'emoji-smile-fill' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Story(node_4, {
		name: 'Theme',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_5();
			var node_5 = $.first_child(fragment_3);

			Styles(node_5, {
				get theme() {
					return theme;
				}
			});

			var div = $.sibling(node_5, 2);
			var node_6 = $.child(div);

			Dropdown(node_6, {
				isOpen: true,
				autoClose: 'manual',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_7 = $.first_child(fragment_4);

					DropdownToggle(node_7, {
						caret: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Menu');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					DropdownMenu(node_8, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_9 = $.first_child(fragment_5);

							DropdownItem(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Another Action');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							DropdownItem(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Another Action');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'light');

				Button(node_11, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'light') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_6 = root_2();
						var node_12 = $.sibling($.first_child(fragment_6));

						Icon(node_12, { name: 'sun-fill' });
						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			}

			var node_13 = $.sibling(node_11, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'dark');

				Button(node_13, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'dark') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_7 = root_3();
						var node_14 = $.sibling($.first_child(fragment_7));

						Icon(node_14, { name: 'moon-stars-fill' });
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			}

			var node_15 = $.sibling(node_13, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'auto');

				Button(node_15, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'auto') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_8 = root_4();
						var node_16 = $.sibling($.first_child(fragment_8));

						Icon(node_16, { name: 'circle-half' });
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$$cleanup();
}