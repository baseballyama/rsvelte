import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let props = $.proxy({ label: 0, size: 0 });
	let filteredProps = $.state(void 0);

	$.user_pre_effect(() => {
		$.set(filteredProps, $.snapshot(props), true);
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Component(node, $.spread_props(() => $.get(filteredProps)));
	$.delegated('click', button, () => props.label++);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);