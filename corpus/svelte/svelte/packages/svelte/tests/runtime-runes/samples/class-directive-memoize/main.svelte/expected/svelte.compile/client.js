import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click</button> <div></div>`, 1);

export default function Main($$anchor) {
	function is_red() {
		console.log("is_red()");

		return "red";
	}

	let active = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	let classes;

	$.template_effect(($0) => classes = $.set_class(div, 1, '', null, classes, { red: $0, active: $.get(active) }), [() => is_red()]);
	$.delegated('click', button, () => $.set(active, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);