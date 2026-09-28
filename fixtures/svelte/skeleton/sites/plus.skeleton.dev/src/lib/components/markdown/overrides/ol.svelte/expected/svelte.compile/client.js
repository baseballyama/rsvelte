import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<ol><!></ol>`);

export default function Ol($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var ol = root();

	$.attribute_effect(ol, () => ({ class: 'list-decimal list-outside pl-4 space-y-1', ...rest }));

	var node = $.child(ol);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ol);
	$.append($$anchor, ol);
}