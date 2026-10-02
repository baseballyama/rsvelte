import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button> <button>decrement</button> <button> </button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	const handlers = { current: increment };

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	function decrement() {
		$.set(count, $.get(count) - 1);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var text = $.only_child(button_2);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => handlers.current = increment);
	$.delegated('click', button_1, () => handlers.current = decrement);

	$.delegated('click', button_2, function (...$$args) {
		handlers.current?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);