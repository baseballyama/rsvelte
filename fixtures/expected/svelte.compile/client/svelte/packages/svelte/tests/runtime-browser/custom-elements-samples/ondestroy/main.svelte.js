import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from "svelte";

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let el;
	let parentEl;

	onMount(() => {
		parentEl = el.parentNode.host.parentElement;

		return () => {
			parentEl.dataset.onMountDestroyed = true;
		};
	});

	onDestroy(() => {
		parentEl.dataset.destroyed = true;
	});

	var div = root();

	$.bind_this(div, ($$value) => el = $$value, () => el);
	$.append($$anchor, div);
	$.pop();
}

customElements.define('my-app', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));