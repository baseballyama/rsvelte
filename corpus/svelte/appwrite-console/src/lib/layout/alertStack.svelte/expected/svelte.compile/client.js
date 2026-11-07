import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, onMount, onDestroy } from 'svelte';
import { isTabletViewport } from '$lib/stores/viewport';
import { afterNavigate } from '$app/navigation';
import { bannerSpacing } from './headerAlert.svelte';

var root = $.from_html(`<div class="alert-stack svelte-19y0cr0"><!></div>`);

export default function AlertStack($$anchor, $$props) {
	$.push($$props, true);

	const $isTabletViewport = () => $.store_get(isTabletViewport, '$isTabletViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
			const topOffset = alertHeight + ($isTabletViewport() ? 0 : headerHeight);

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

	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}