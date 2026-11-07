import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>array.includes(primitive)</button> <button>array.includes(object)</button> <hr/> <button>array.indexOf(primitive)</button> <button>array.indexOf(object)</button> <hr/> <button>array.lastIndexOf(primitive)</button> <button>array.lastIndexOf(object)</button> <hr/> <button>clear</button>`, 1);

export default function Main($$anchor) {
	let primitive = 'foo';
	let object = {};
	let array = $.proxy([primitive, object]);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 4);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 4);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 4);

	$.delegated('click', button, () => array.includes(primitive));
	$.delegated('click', button_1, () => array.includes(object));
	$.delegated('click', button_2, () => array.indexOf(primitive));
	$.delegated('click', button_3, () => array.indexOf(object));
	$.delegated('click', button_4, () => array.lastIndexOf(primitive));
	$.delegated('click', button_5, () => array.lastIndexOf(object));
	$.delegated('click', button_6, () => array.length = 0);
	$.append($$anchor, fragment);
}

$.delegate(['click']);