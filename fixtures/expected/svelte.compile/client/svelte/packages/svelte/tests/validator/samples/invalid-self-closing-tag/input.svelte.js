import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link/> <svg><g></g></svg> <math><mspace></mspace></math> <enhanced:img></enhanced:img> <div></div> <my-thing></my-thing>`, 3);

export default function Input($$anchor) {
	var fragment = root();
	var my_thing = $.sibling($.first_child(fragment), 10);

	$.append($$anchor, fragment);
}