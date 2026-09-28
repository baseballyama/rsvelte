import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div class="example svelte-l9ubyg"><div class="text svelte-l9ubyg" contenteditable="">Edit this text</div> <div class="size svelte-l9ubyg"> </div></div></div>`);

export default function Readonly_bindings($$anchor) {
	let width = $.state(void 0);
	let height = $.state(void 0);
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var text = $.only_child(div_2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(width) ?? ''} x ${$.get(height) ?? ''}`));
	$.bind_element_size(div_1, 'clientWidth', ($$value) => $.set(width, $$value));
	$.bind_element_size(div_1, 'clientHeight', ($$value) => $.set(height, $$value));
	$.append($$anchor, div);
}