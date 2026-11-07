import * as $ from 'svelte/internal/server';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _page($$renderer) {
	let bottomAppBar = null;

	AutoAdjust($$renderer, {
		bottomAppBar,
		children: ($$renderer) => {
			$$renderer.push(`<h5>Inset FAB (Right)</h5> `);
			LoremIpsum($$renderer, {});
			$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	BottomAppBar($$renderer, {
		children: ($$renderer) => {
			Section($$renderer, {
				children: ($$renderer) => {
					IconButton($$renderer, {
						'aria-label': 'Archive',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->archive`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					IconButton($$renderer, {
						'aria-label': 'Mark unread',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->mail`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					IconButton($$renderer, {
						'aria-label': 'Label',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->label`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					IconButton($$renderer, {
						'aria-label': 'Trash',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->delete`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Section($$renderer, {
				fabInset: true,
				children: ($$renderer) => {
					Fab($$renderer, {
						'aria-label': 'Reply',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->reply`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}