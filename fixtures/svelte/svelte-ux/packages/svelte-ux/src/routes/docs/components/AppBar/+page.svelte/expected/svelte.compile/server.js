import * as $ from 'svelte/internal/server';
import { AppBar, Button, ListItem } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import { mdiRefresh, mdiChevronRight, mdiMicrosoftXboxControllerMenu } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Title as string</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, { title: 'Example' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Title as array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, { title: ['One', 'Two', 'Three'] });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Title as slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, {
					title: 'Example (shown in window title)',
					$$slots: {
						title: ($$renderer) => {
							$$renderer.push(`<div slot="title">`);
							ListItem($$renderer, { title: 'Example', subheading: 'Subheading' });
							$$renderer.push(`<!----></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Actions</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, {
					title: 'Example',
					$$slots: {
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);
							Button($$renderer, { icon: mdiRefresh, class: 'p-2 hover:bg-surface-100/10' });
							$$renderer.push(`<!----></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				AppBar($$renderer, { title: 'Example', class: 'bg-primary text-primary-content' });
				$$renderer.push(`<!----> `);
				AppBar($$renderer, { title: 'Example', class: 'bg-blue-500 text-primary-content' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>menuIcon prop</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, { title: 'Example', menuIcon: mdiMicrosoftXboxControllerMenu });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>menuIcon slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, {
					title: 'Example',
					$$slots: {
						menuIcon: ($$renderer, { toggleMenu, isMenuOpen }) => {
							{
								Button($$renderer, {
									icon: mdiChevronRight,
									class: cls('p-3 transition-transform', isMenuOpen && 'rotate-180')
								});
							}
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>remove icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				AppBar($$renderer, { title: 'Example', menuIcon: null });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}