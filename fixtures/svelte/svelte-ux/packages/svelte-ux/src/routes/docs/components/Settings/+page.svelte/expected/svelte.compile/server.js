import * as $ from 'svelte/internal/server';
import { Button, Menu, MenuItem, Settings, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Settings($$renderer, {
				components: {
					Button: { classes: 'border-2 font-bold' },
					Menu: { classes: 'shadow-xl border-gray-500' },
					MenuItem: { classes: 'font-bold' }
				},

				children: ($$renderer) => {
					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								Button($$renderer, {
									variant: 'outline',
									color: 'primary',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Click me `);

										Menu($$renderer, {
											open,
											children: ($$renderer) => {
												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Refresh`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Settings`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Help`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Sign In`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													disabled: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Disabled`);
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
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}