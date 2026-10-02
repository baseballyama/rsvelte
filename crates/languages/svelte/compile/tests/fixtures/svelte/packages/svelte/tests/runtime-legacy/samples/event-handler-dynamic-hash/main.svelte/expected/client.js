import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><button>set handler 1</button> <button>set handler 2</button></p> <p> </p> <button>click</button>`, 1);

export default function Main($$anchor) {
	let clickHandler = {};
	let number = 0;

	function updateHandler1() {
		clickHandler.f = () => number = 1;
	}

	function updateHandler2() {
		clickHandler.f = () => number = 2;
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var button = $.child(p);
	var button_1 = $.sibling(button, 2);

	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var text = $.only_child(p_1, true);
	var button_2 = $.sibling(p_1, 2);

	$.template_effect(() => $.set_text(text, number));
	$.event('click', button, updateHandler1);
	$.event('click', button_1, updateHandler2);

	$.event('click', button_2, function (...$$args) {
		clickHandler.f?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}