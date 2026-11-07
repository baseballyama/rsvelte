import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<!> <div> </div>`, 1);

export default function Main($$anchor) {
	let bar;
	var fragment = root();
	var node = $.first_child(fragment);

	Widget(node, {
		get bar() {
			return bar;
		},

		set bar($$value) {
			bar = $$value;
		}
	});

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, bar));
	$.append($$anchor, fragment);
}