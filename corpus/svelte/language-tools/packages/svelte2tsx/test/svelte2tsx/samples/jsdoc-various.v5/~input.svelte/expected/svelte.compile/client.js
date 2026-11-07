import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor, bar = $.noop) => {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, bar()));
	$.append($$anchor, text);
};

var root = $.from_html(`<div></div> <!>`, 1);

export default function Input($$anchor, $$props) {
	/** @type {{ b: T }}*/
	let rect;

	var fragment_1 = root();
	var div = $.first_child(fragment_1);
	var node = $.sibling(div, 2);

	$.slot(node, $$props, 'default', {}, null);
	$.bind_resize_observer(div, 'contentRect', ($$value) => rect = $$value);
	$.append($$anchor, fragment_1);
}