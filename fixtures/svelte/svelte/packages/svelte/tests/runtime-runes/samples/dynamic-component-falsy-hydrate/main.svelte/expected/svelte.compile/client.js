import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HelloWorld from './HelloWorld.svelte';

var root = $.from_html(`<h1>Test</h1> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let Component = $.state(void 0);

	$.user_pre_effect(() => {
		$.set(Component, HelloWorld, true);
	});

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.component(node, () => $.get(Component), ($$anchor, Component_1) => {
		Component_1($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}