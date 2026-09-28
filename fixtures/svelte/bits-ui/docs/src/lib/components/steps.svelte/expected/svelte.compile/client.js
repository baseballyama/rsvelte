import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Steps($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, () => ({
		class: '[&>h3]:step mb-12 ml-4 border-l pl-8 [counter-reset:step]',
		...restProps
	}));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}