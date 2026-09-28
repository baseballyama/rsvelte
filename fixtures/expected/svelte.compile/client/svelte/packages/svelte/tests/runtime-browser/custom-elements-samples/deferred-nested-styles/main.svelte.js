import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));

	// Add the item _after_ the initial mount, so that the each block renders the
	// new item into an offscreen anchor that is discarded once it's committed to
	// the DOM. This reproduces styles being injected into `document.head` instead
	// of the shadow root (https://github.com/sveltejs/svelte/issues/18288)
	onMount(() => {
		$.set(items, [1], true);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => $.get(items), (item) => item, ($$anchor, item) => {
		Child($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}

customElements.define('my-app', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));