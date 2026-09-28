import * as $ from 'svelte/internal/server';
import { Avatar, Icon } from 'svelte-ux';
import { mdiAccount } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Color</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, {
				class: 'bg-primary text-primary-content font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->A`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Border</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, {
				class: 'border',
				children: ($$renderer) => {
					$$renderer.push(`<!---->A`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Size</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, {
				class: 'bg-primary text-primary-content font-bold text-xs',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->sm`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Avatar($$renderer, {
				class: 'bg-primary text-primary-content font-bold',
				size: 'md',
				children: ($$renderer) => {
					$$renderer.push(`<!---->md`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Avatar($$renderer, {
				class: 'bg-primary text-primary-content font-bold',
				size: 'lg',
				children: ($$renderer) => {
					$$renderer.push(`<!---->lg`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icon (prop)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, { class: 'bg-primary text-primary-content', icon: mdiAccount });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icon (slot)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Avatar($$renderer, {
				class: 'bg-primary',
				children: ($$renderer) => {
					Icon($$renderer, { data: mdiAccount, class: 'text-primary-content' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}