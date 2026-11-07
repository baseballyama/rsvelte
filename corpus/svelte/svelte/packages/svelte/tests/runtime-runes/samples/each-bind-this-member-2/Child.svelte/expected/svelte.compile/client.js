import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let item = $.prop($$props, 'item', 15);
	var div = root();
	var text = $.only_child(div, true);

	$.bind_this(div, ($$value) => item(item().dom = $$value, true), () => item()?.dom);
	$.template_effect(() => $.set_text(text, item().text));
	$.append($$anchor, div);
	$.pop();
}