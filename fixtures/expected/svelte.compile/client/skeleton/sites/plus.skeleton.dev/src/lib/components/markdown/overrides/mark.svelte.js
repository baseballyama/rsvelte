import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<mark><!></mark>`);

export default function Mark($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var mark = root();

	$.attribute_effect(mark, () => ({ class: 'mark', ...rest }));

	var node = $.child(mark);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(mark);
	$.append($$anchor, mark);
}