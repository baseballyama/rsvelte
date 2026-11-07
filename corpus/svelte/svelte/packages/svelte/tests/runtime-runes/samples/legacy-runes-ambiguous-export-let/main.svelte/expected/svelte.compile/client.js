import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get, set } from "./test.svelte.js";

var root = $.from_html(` <p> </p> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = 42;

	var $$exports = {
		get x() {
			return x;
		},

		set x($$value) {
			x = $$value;
		}
	};

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var p = $.sibling(text);
	var text_1 = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(
		($0) => {
			$.set_text(text, `${x ?? ''} `);
			$.set_text(text_1, $0);
		},
		[() => get()]
	);

	$.delegated('click', button, () => set());
	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);