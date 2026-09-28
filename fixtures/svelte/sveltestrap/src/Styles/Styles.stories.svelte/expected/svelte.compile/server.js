import * as $ from 'svelte/internal/server';
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

import Styles from './Styles.svelte';

export const meta = { title: 'Stories/Styles', component: Styles };

export default function Styles_stories($$renderer) {
	var $$store_subs;
	let theme = $.store_get($$store_subs ??= {}, '$colorMode', colorMode);

	Story($$renderer, {
		name: 'Basic',
		children: ($$renderer) => {
			Styles($$renderer, {});
			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Nice! `);
					Icon($$renderer, { name: 'emoji-smile-fill' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theme',
		children: ($$renderer) => {
			Styles($$renderer, { theme });
			$$renderer.push(`<!----> <div class="horizontal style-example">`);

			Dropdown($$renderer, {
				isOpen: true,
				autoClose: 'manual',
				children: ($$renderer) => {
					DropdownToggle($$renderer, {
						caret: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Menu`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownMenu($$renderer, {
						children: ($$renderer) => {
							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Another Action`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				outline: true,
				active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'light',
				children: ($$renderer) => {
					$$renderer.push(`<!---->light `);
					Icon($$renderer, { name: 'sun-fill' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				outline: true,
				active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'dark',
				children: ($$renderer) => {
					$$renderer.push(`<!---->dark `);
					Icon($$renderer, { name: 'moon-stars-fill' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				outline: true,
				active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'auto',
				children: ($$renderer) => {
					$$renderer.push(`<!---->auto `);
					Icon($$renderer, { name: 'circle-half' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}