import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ExampleComponents from "./examples";

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ExampleComponents.Example1, ($$anchor, ExampleComponents_Example1) => {
		ExampleComponents_Example1($$anchor, {});
	});

	$.append($$anchor, fragment);
}