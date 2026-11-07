import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="missing svelte-9fyfo5">Unknown name</span>`);
var root_1 = $.from_html(`<span class="missing svelte-9fyfo5">Unknown address</span>`);
var root_2 = $.from_html(`<span class="missing svelte-9fyfo5">Unknown email</span>`);
var root_3 = $.from_html(`<article class="contact-card svelte-9fyfo5"><h2 class="svelte-9fyfo5"><!></h2> <div class="address svelte-9fyfo5"><!></div> <div class="email svelte-9fyfo5"><!></div></article>`);

export default function Named_slots02_input($$anchor, $$props) {
	var article = root_3();
	var h2 = $.child(article);
	var node = $.child(h2);

	$.slot(node, $$props, 'name', {}, ($$anchor) => {
		var span = root();

		$.append($$anchor, span);
	});

	$.reset(h2);

	var div = $.sibling(h2, 2);
	var node_1 = $.child(div);

	$.slot(node_1, $$props, 'address', {}, ($$anchor) => {
		var span_1 = root_1();

		$.append($$anchor, span_1);
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	$.slot(node_2, $$props, 'email', {}, ($$anchor) => {
		var span_2 = root_2();

		$.append($$anchor, span_2);
	});

	$.reset(div_1);
	$.reset(article);
	$.append($$anchor, article);
}