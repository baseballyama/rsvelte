import * as $ from 'svelte/internal/server';
import { CopyButton } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2"><div>`);
			CopyButton($$renderer, { value: 'Stop copying me!' });
			$$renderer.push(`<!----></div> <div>`);
			CopyButton($$renderer, { value: 'Stop copying me!', color: 'primary' });
			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'outline'
			});

			$$renderer.push(`<!----></div> <div>`);
			CopyButton($$renderer, { value: 'Stop copying me!', color: 'primary', variant: 'fill' });
			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-light'
			});

			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-outline'
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Size</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2"><div>`);
			CopyButton($$renderer, { value: 'Stop copying me!', size: 'sm' });
			$$renderer.push(`<!----></div> <div>`);
			CopyButton($$renderer, { value: 'Stop copying me!', color: 'primary', size: 'sm' });
			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'outline',
				size: 'sm'
			});

			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill',
				size: 'sm'
			});

			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-light',
				size: 'sm'
			});

			$$renderer.push(`<!----></div> <div>`);

			CopyButton($$renderer, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-outline',
				size: 'sm'
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Using a Function</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			CopyButton($$renderer, { value: () => 'Stop copying me!' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>With Custom Message</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			CopyButton($$renderer, { value: 'Stop copying me!', message: 'I copied it...' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>With Alternate Notification</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			CopyButton($$renderer, { value: 'Stop copying me!', message: null });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}