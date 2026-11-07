import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>  <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.event('click', $.window, () => '');
	$.event('click', $.window, () => '');
	$.event('click', $.document.body, () => '');
	$.event('click', $.document.body, () => '');

	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);

	$.event('click', div, () => '');
	$.event('click', div_1, () => '');
	$.event('click', div_1, () => '');
	$.event('wat', div_2, () => '');
	$.event('click', div_3, (e) => e.asd);
	$.append($$anchor, fragment);
}