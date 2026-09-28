import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click</button> <div></div>`, 1);

export default function Main($$anchor) {
	function makeColor() {
		console.log("makeColor()");

		return "red";
	}

	let size = $.state('1em');
	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	let styles;

	$.template_effect(($0) => styles = $.set_style(div, '', styles, { 'background-color': $0, 'font-size': $.get(size) }), [() => makeColor()]);
	$.delegated('click', button, () => $.set(size, '2em'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);