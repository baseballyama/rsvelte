import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>go</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let count1 = $.state(0);
	let count2 = $.state(0);
	let cache = $.proxy({});

	function go() {
		$.update(count1);

		const value = cache.value ??= get_value();
	}

	function get_value() {
		$.update(count2);

		return 42;
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `count1: ${$.get(count1) ?? ''}, count2: ${$.get(count2) ?? ''}`));
	$.delegated('click', button, go);
	$.append($$anchor, fragment);
}

$.delegate(['click']);