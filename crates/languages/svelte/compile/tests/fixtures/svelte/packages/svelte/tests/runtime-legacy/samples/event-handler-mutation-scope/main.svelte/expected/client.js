import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increase both</button> `, 1);

export default function Main($$anchor) {
	let referenced_directly = 0;
	let not_referenced_directly = 0;
	let css_based_on_not_referenced = '';

	function click() {
		referenced_directly += 1;
		not_referenced_directly += 1;
		css_based_on_not_referenced = not_referenced_directly % 2 == 1 ? 'background-color: red' : '';
		console.log(referenced_directly + ' - ' + not_referenced_directly); //only referenced_directly is increasing
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => {
		$.set_style(button, css_based_on_not_referenced);
		$.set_text(text, ` ${referenced_directly ?? ''}`);
	});

	$.event('click', button, click);
	$.append($$anchor, fragment);
}