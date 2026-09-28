import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_html(`<button> </button> <button> </button> <!>`, 1);

export default function Main($$anchor) {
	let a = 0;
	let b = 0;
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);
	var node = $.sibling(button_1, 2);

	Child(node, {
		get a() {
			return a;
		},

		get b() {
			return b;
		}
	});

	$.template_effect(() => {
		$.set_text(text, `a: ${a ?? ''}`);
		$.set_text(text_1, `b: ${b ?? ''}`);
	});

	$.event('click', button, () => a += 1);
	$.event('click', button_1, () => b += 1);
	$.append($$anchor, fragment);
}