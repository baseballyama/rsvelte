import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "./Button.svelte";

var root = $.from_html(`<button>Hello world</button> <!>`, 1);

export default function Main($$anchor) {
	const attrs = {};

	Object.defineProperty(attrs, "data-attr", { value: "", enumerable: true });

	var fragment = root();
	var button = $.first_child(fragment);

	$.attribute_effect(button, () => ({ ...attrs }));

	var node = $.sibling(button, 2);

	Button(node, $.spread_props(() => attrs));
	$.append($$anchor, fragment);
}