import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import docsearch from '@docsearch/js';
import { onMount } from 'svelte';
import '@docsearch/css/dist/style.css';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'appId',
	'apiKey',
	'indexName'
]);

var root = $.from_html(`<div class="ml-4"></div>`);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	let containerEl = $.state(void 0);

	// Re-initializing docsearch on theme change (wiping the container and
	// mounting again) silently fails and leaves the button unmounted. Instead
	// we mount ONCE and keep `data-theme` on <html> in sync — docsearch v4's
	// palette and our overrides both key off `[data-theme='dark']`. We must
	// NOT pass the `theme` option: docsearch pins it back onto <html> every
	// time the modal opens, undoing a later manual theme switch.
	function syncTheme() {
		const isDark = document.documentElement.classList.contains('dark');

		document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
	}

	// docsearch v4 renders the modal inline in its container instead of
	// portaling to <body> (v3 behavior). Inside the fixed navbar that traps
	// the modal in the header's stacking context (painted under the sidebar)
	// and its backdrop-filter containing block. Lift it out on open — moved
	// DOM keeps working since the listeners live on the nodes themselves.
	function liftModal() {
		const modal = $.get(containerEl)?.querySelector('.DocSearch-Container');

		if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);
	}

	onMount(() => {
		if (!$.get(containerEl)) return;

		syncTheme();

		docsearch({
			container: $.get(containerEl),
			appId: $$props.appId,
			apiKey: $$props.apiKey,
			indexName: $$props.indexName,
			...rest
		});

		const themeObserver = new MutationObserver(syncTheme);

		themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		const modalObserver = new MutationObserver(liftModal);

		modalObserver.observe($.get(containerEl), { childList: true });

		return () => {
			themeObserver.disconnect();
			modalObserver.disconnect();
		};
	});

	var div = root();

	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.append($$anchor, div);
	$.pop();
}