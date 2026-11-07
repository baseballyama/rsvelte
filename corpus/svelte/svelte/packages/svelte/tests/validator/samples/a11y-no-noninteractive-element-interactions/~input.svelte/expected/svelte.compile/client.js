import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="presentation"></div> <div role="button" tabindex="-1"></div> <div role="listitem" aria-hidden="true"></div> <button>click me</button> <dialog>alert</dialog> <h1 contenteditable="true">Heading</h1> <h1>Heading</h1> <div role="listitem"></div> <h1>Heading</h1> <h1 role="banner">Heading</h1> <p></p> <div role="paragraph"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var button = $.sibling(div_2, 2);
	var dialog = $.sibling(button, 2);
	var h1 = $.sibling(dialog, 2);
	var div_3 = $.sibling(h1, 4);
	var h1_1 = $.sibling(div_3, 2);
	var h1_2 = $.sibling(h1_1, 2);
	var p = $.sibling(h1_2, 2);
	var div_4 = $.sibling(p, 2);

	$.event('mouseup', div, () => {});
	$.event('click', div_1, () => {});
	$.event('keypress', div_1, () => {});
	$.event('click', div_2, () => {});
	$.event('keypress', div_2, () => {});
	$.event('click', button, () => {});
	$.event('click', dialog, () => {});
	$.event('keydown', h1, () => {});
	$.event('mousedown', div_3, () => {});
	$.event('click', h1_1, () => {});
	$.event('keydown', h1_1, () => {});
	$.event('keyup', h1_2, () => {});
	$.event('keypress', p, () => {});
	$.event('mouseup', div_4, () => {});
	$.append($$anchor, fragment);
}