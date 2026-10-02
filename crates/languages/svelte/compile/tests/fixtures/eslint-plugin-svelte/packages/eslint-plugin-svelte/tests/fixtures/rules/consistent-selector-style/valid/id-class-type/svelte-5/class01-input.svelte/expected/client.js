import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const iterated = ($$anchor) => {
	var span = root();

	$.append($$anchor, span);
};

var root = $.from_html(`<span class="iterated-snippet svelte-1srp9ab">Text 4</span>`);
var root_1 = $.from_html(`<span>Outside</span>`);

export default function Class01_input($$anchor) {
	var span_1 = root_1();

	$.append($$anchor, span_1);
}