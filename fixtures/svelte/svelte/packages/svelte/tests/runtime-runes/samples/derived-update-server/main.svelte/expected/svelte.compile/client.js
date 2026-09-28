import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function Main($$anchor) {
	let count = $.derived(() => 0);
	let postfix = $.update(count);
	let postfix_minus = $.update(count, -1);
	let prefix = $.update_pre(count);
	let prefix_minus = $.update_pre(count, -1);
	let count_n = $.derived(() => 0n);
	let postfix_n = $.update(count_n);
	let postfix_minus_n = $.update(count_n, -1);
	let prefix_n = $.update_pre(count_n);
	let prefix_minus_n = $.update_pre(count_n, -1);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(() => {
		$.set_text(text, `postfix: ${postfix ?? ''}, postfix_minus: ${postfix_minus ?? ''}, prefix: ${prefix ?? ''}, prefix_minus: ${prefix_minus ?? ''}, count: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `postfix_n: ${postfix_n ?? ''}, postfix_minus_n: ${postfix_minus_n ?? ''}, prefix_n: ${prefix_n ?? ''}, prefix_minus_n: ${prefix_minus_n ?? ''}, count_n: ${$.get(count_n) ?? ''}`);
	});

	$.append($$anchor, fragment);
}