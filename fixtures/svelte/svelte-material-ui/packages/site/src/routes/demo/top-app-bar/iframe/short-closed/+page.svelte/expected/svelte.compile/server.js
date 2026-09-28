import * as $ from 'svelte/internal/server';
import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _page($$renderer) {
	let topAppBar = null;

	TopAppBar($$renderer, {
		variant: 'short',
		collapsed: true,
		children: ($$renderer) => {
			Row($$renderer, {
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

							$$renderer.push(`<!----> `);

							Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Short`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Section($$renderer, {
						align: 'end',
						toolbar: true,
						children: ($$renderer) => {
							IconButton($$renderer, {
								'aria-label': 'Download',
								children: ($$renderer) => {
									Icon($$renderer, {
										class: 'material-icons',
										children: ($$renderer) => {
											$$renderer.push(`<!---->file_download`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AutoAdjust($$renderer, {
		topAppBar,
		children: ($$renderer) => {
			$$renderer.push(`<h5>Short, Always Collapsed</h5> `);
			LoremIpsum($$renderer, {});
			$$renderer.push(`<!----> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}