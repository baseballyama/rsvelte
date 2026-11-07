import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!>`, 1);

export default function Svelte_component01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	let component = writable(MyComponent);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => component, ($$anchor, $$component) => {
		$$component($$anchor, {
			get prop() {
				return `Hello ${store ?? ''}`;
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => component, ($$anchor, $$component) => {
		$.bind_this($$component($$anchor, {}), ($$value) => store = $$value, () => store);
	});

	var node_2 = $.sibling(node_1, 2);

	{
		$.css_props(node_2, () => ({ '--my-style-var': store }));

		$.component(node_2.lastChild, () => component, ($$anchor, $$component) => {
			$$component($$anchor, {});
		});

		$.reset(node_2);
	}

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => component, ($$anchor, $$component) => {
		$$component($$anchor, $.spread_props(() => store));
	});

	$.append($$anchor, fragment);
	$.pop();
}