import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button> <div role="button"></div> <input type="text"/> <div></div> <a href="/foo">link</a> <div></div> <footer></footer> <div></div> <a>link</a> <div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	const dynamicRole = "button";
	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var input = $.sibling(div, 2);
	var div_1 = $.sibling(input, 2);
	var a = $.sibling(div_1, 2);
	var div_2 = $.sibling(a, 2);

	$.set_attribute(div_2, 'role', dynamicRole);

	var footer = $.sibling(div_2, 2);
	var div_3 = $.sibling(footer, 2);
	var a_1 = $.sibling(div_3, 2);
	var div_4 = $.sibling(a_1, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);

	$.event('click', button, () => {});
	$.event('keydown', div, () => {});
	$.event('click', input, () => {});
	$.event('copy', div_1, () => {});
	$.event('click', a, () => {});
	$.event('click', div_2, () => {});
	$.event('keydown', footer, () => {});
	$.event('keydown', div_3, () => {});
	$.event('mousedown', a_1, () => {});
	$.event('mouseup', a_1, () => {});
	$.event('copy', a_1, () => {});
	$.event('pointerdown', div_4, () => {});
	$.event('pointerenter', div_5, () => {});
	$.event('touchstart', div_6, () => {});
	$.append($$anchor, fragment);
}