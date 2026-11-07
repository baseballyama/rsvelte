import * as $ from 'svelte/internal/server';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _page($$renderer) {
	let bottomAppBar = null;

	AutoAdjust($$renderer, {
		bottomAppBar,
		children: ($$renderer) => {
			$$renderer.push(`<h5>Fixed</h5> `);
			LoremIpsum($$renderer, {});
			$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	BottomAppBar($$renderer, {
		variant: 'fixed',
		children: ($$renderer) => {
			Section($$renderer, {
				children: ($$renderer) => {
					IconButton($$renderer, {
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->menu`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Section($$renderer, {
				children: ($$renderer) => {
					IconButton($$renderer, {
						'aria-label': 'Search',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->search`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					IconButton($$renderer, {
						'aria-label': 'More',
						children: ($$renderer) => {
							Icon($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->more_vert`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}