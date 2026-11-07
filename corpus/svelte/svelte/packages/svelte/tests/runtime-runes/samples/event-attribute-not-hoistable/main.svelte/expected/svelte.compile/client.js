import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function declared_in_module_scope() {
	return 'x';
}

let a = declared_in_module_scope();
let b = 'x';

try {
	b = doesnt_exist();
} catch(e) {
	b = 'y';
}

var root = $.from_html(`<button> </button> <button> </button> <button> </button>`, 1);

export default function Main($$anchor) {
	let count1 = $.state(0);
	let count2 = $.state(0);
	let count3 = $.state(0);

	function increment() {
		$.set(count1, $.get(count1) + 1);
	}

	function declared_in_module_scope() {
		$.set(count2, $.get(count2) + 1);
	}

	function doesnt_exist() {
		$.set(count3, $.get(count3) + 1);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);
	var button_2 = $.sibling(button_1, 2);
	var text_2 = $.only_child(button_2);

	$.template_effect(() => {
		$.set_text(text, $.get(count1));
		$.set_text(text_1, `${a ?? ''}${$.get(count2) ?? ''}`);
		$.set_text(text_2, `${b ?? ''}${$.get(count3) ?? ''}`);
	});

	$.delegated('click', button, increment);
	$.event('mouseenter', button, increment);
	$.delegated('click', button_1, declared_in_module_scope);
	$.delegated('click', button_2, doesnt_exist);
	$.append($$anchor, fragment);
}

$.delegate(['click']);