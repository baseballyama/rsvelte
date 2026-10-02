import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./inner.svelte";

var root = $.from_html(`<button>set color</button> <button>set options</button> <!> <!>`, 1);

export default function Main($$anchor) {
	let testProps = $.state($.proxy({ color: "red" }));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	Inner(node, $.spread_props(() => $.get(testProps)));

	var node_1 = $.sibling(node, 2);

	Inner(node_1, {
		get color() {
			return $.get(testProps).color;
		}
	});

	$.delegated('click', button, () => {
		$.set(testProps, { color: "blue" }, true);
	});

	$.delegated('click', button_1, () => {
		$.set(testProps, { color: "pink", options: 'baz' }, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);