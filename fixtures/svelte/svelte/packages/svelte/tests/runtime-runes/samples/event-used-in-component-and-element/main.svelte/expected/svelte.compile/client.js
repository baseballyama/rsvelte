import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node = $.sibling(button, 2);

	Sub(node, { onClick: increment });
	$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, fragment);
}