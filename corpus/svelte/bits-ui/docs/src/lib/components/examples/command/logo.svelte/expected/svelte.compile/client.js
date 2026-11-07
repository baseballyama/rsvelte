import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="blurLogo"><div class="bg" aria-hidden="true"><!></div> <div class="inner"><!></div></div>`);

export default function Logo($$anchor, $$props) {
	let size = $.prop($$props, 'size', 3, "20px");
	var div = root();
	let styles;
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => styles = $.set_style(div, '', styles, { width: size(), height: size() }));
	$.append($$anchor, div);
}