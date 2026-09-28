import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get, set } from "./test.svelte.js";

var root = $.from_html(`<p> </p> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const x = 42;
	var $$exports = { x };
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(($0) => $.set_text(text, $0), [() => get()]);
	$.delegated('click', button, () => set());
	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);