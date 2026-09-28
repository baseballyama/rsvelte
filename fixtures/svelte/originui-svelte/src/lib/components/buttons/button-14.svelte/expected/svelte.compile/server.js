import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

export default function Button_14($$renderer) {
	let isLoading = false;

	function handleClick() {
		isLoading = true;

		// Simulate an async operation
		setTimeout(
			() => {
				isLoading = false;
			},
			1000
		); // Reset after 1 second
	}

	Button($$renderer, {
		onclick: handleClick,
		disabled: isLoading,
		'data-loading': isLoading,
		class: 'group relative disabled:opacity-100',
		children: ($$renderer) => {
			$$renderer.push(`<span class="group-data-[loading=true]:text-transparent">Click me</span> `);

			if (isLoading) {
				$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center">`);
				LoaderCircle($$renderer, { class: 'animate-spin', size: 16, 'aria-hidden': 'true' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}