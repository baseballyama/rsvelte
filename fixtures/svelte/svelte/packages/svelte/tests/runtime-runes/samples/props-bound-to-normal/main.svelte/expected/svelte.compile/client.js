import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./Inner.svelte";

var root = $.from_html(`<button> </button> <!> <!>`, 1);

export default function Main($$anchor) {
	let bar = $.state(0);

	let foo = {
		get bar() {
			return $.get(bar);
		},

		set bar(v) {
			$.set(bar, v, true);
		}
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	Inner(node, {
		get bar() {
			return foo.bar;
		},

		set bar($$value) {
			foo.bar = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Inner(node_1, {
		get bar() {
			return foo.bar;
		}
	});

	$.template_effect(() => $.set_text(text, foo.bar));
	$.event('click', button, () => $.update(bar));
	$.append($$anchor, fragment);
}