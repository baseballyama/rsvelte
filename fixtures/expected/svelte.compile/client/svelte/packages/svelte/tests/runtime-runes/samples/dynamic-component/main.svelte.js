import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';

var root = $.from_html(`<button>switch</button> <!> <!>`, 1);

export default function Main($$anchor) {
	let Component = $.state($.proxy(Component1));

	let Object = {
		get component() {
			return $.get(Component);
		}
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => $.get(Component), ($$anchor, Component_1) => {
		Component_1($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Object.component, ($$anchor, Object_component) => {
		Object_component($$anchor, {});
	});

	$.delegated('click', button, () => $.set(Component, Component2, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);