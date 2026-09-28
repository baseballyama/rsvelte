import * as $ from 'svelte/internal/server';
import { setContext, onMount, onDestroy } from 'svelte';
import { isTabletViewport } from '$lib/stores/viewport';
import { afterNavigate } from '$app/navigation';
import { bannerSpacing } from './headerAlert.svelte';

export default function AlertStack($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Signal to child HeaderAlert components that layout is managed here
		setContext('isInAlertStack', true);

		let container = null;
		let resizeObserver;

		function setNavigationHeight() {
			const alertHeight = container ? container.getBoundingClientRect().height : 0;

			if (alertHeight) {
				bannerSpacing.set(`${alertHeight}px`);
			} else {
				bannerSpacing.set(null);
			}

			const header = document.querySelector('main > header');
			const sidebar = document.querySelector('main nav');
			const contentSection = document.querySelector('main .main-content');

			if (header) {
				header.style.top = `${alertHeight}px`;
			}

			if (sidebar) {
				const headerHeight = header?.getBoundingClientRect().height ?? 0;
				const topOffset = alertHeight + ($.store_get($$store_subs ??= {}, '$isTabletViewport', isTabletViewport) ? 0 : headerHeight);

				sidebar.style.top = `${topOffset}px`;
				sidebar.style.height = `calc(100vh - ${topOffset}px)`;
			}

			if (contentSection) {
				contentSection.style.paddingBlockStart = `${alertHeight}px`;
			}
		}

		onMount(() => {
			if (container) {
				resizeObserver = new ResizeObserver(setNavigationHeight);
				resizeObserver.observe(container);
			}
		});

		onDestroy(() => {
			container = null;
			setNavigationHeight();

			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		});

		afterNavigate(() => setNavigationHeight());
		$$renderer.push(`<div class="alert-stack svelte-19y0cr0"><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}