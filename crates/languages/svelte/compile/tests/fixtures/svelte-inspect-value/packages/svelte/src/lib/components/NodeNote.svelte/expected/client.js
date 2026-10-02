import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<span><!></span>`);

export default function NodeNote($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var span = root();

	$.attribute_effect(span, () => ({ 'data-testid': 'note', ...rest }), void 0, void 0, void 0, 'svelte-1e8qtma');

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.append($$anchor, span);
}