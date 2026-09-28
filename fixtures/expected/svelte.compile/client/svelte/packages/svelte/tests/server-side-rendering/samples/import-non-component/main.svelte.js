import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import answer from './answer.js';
import problems from './problems.js';

var root = $.from_html(`<div> </div> <div> </div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);

	$.template_effect(() => {
		$.set_text(text, `i got ${problems ?? ''} problems`);
		$.set_text(text_1, `the answer is ${answer ?? ''}`);
	});

	$.append($$anchor, fragment);
}