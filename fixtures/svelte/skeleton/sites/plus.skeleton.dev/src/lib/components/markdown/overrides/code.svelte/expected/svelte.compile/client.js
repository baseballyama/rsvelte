import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<code><!></code>`);

export default function Code($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var code = root();

	$.attribute_effect(code, () => ({ class: 'code', ...rest }));

	var node = $.child(code);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(code);
	$.append($$anchor, code);
}