import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Component, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.append($$anchor, fragment);
}