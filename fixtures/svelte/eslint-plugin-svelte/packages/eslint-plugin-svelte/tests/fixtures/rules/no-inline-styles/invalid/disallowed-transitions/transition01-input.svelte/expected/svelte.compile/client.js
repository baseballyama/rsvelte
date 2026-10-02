import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade, fly } from 'svelte/transition';

var root = $.from_html(`<span>Hello World!</span> <span>Hello World!</span>`, 1);

export default function Transition01_input($$anchor) {
	var fragment = root();
	var span = $.first_child(fragment);
	var span_1 = $.sibling(span, 2);

	$.transition(3, span, () => fade);
	$.transition(3, span_1, () => fly, () => ({ y: 200, duration: 2000 }));
	$.append($$anchor, fragment);
}