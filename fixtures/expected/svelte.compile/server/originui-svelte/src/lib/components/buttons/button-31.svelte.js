import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
import FilesIcon from '@lucide/svelte/icons/files';
import FilmIcon from '@lucide/svelte/icons/film';

export default function Button_31($$renderer) {
	$$renderer.push(`<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">`);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		children: ($$renderer) => {
			FilesIcon($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Files`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		children: ($$renderer) => {
			FilmIcon($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Media`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Menu',
		children: ($$renderer) => {
			EllipsisIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}