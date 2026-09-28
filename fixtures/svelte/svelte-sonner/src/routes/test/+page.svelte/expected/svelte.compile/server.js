import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Toaster, toast } from '$lib/index.js';
import CustomIcon from './CustomIcon.svelte';
import WideDescription from './WideDescription.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const params = page.url.searchParams;
		const position = params.get('position') ?? 'bottom-right';
		const gap = params.has('gap') ? Number(params.get('gap')) : undefined;
		const swipeDirections = params.get('swipeDirections')?.split(',');
		const secondToaster = params.has('secondToaster');

		// Runs during component init, before the <Toaster /> below has mounted
		if (params.has('toastOnMount')) {
			toast('Toast rendered on mount');
		}

		function promiseWithCustomIcon() {
			toast.promise(new Promise((resolve) => setTimeout(resolve, 200)), { loading: 'Loading...', success: 'Loaded', icon: CustomIcon });
		}

		function dismissAndRecreate() {
			const id = toast('Original toast');

			toast.dismiss(id);

			// recreate while the exit-animation removal is still pending
			setTimeout(() => toast('Remounted toast', { id }), 100);
		}

		Toaster($$renderer, {
			position,
			gap,
			swipeDirections,
			toastOptions: {
				classes: {
					default: 'default-toast-classname',
					success: 'success-toast-classname'
				}
			}
		});

		$$renderer.push(`<!----> `);

		if (secondToaster) {
			$$renderer.push('<!--[0-->');
			Toaster($$renderer, { id: 'secondary', position: 'top-left' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <main><button data-testid="default-button">Default</button> <button data-testid="success">Success</button> <button data-testid="promise-custom-icon">Promise with custom icon</button> <button data-testid="dismiss-and-recreate">Dismiss and recreate</button> <button data-testid="component-description">Wide description</button> <button data-testid="action">Action</button> <button data-testid="toast-to-secondary">To secondary toaster</button></main>`);
	});
}