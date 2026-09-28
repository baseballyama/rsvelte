import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="relative inline-block"><!></span>`);

export default function Tooltip($$anchor, $$props) {
	var span = root();
	var node = $.child(span);

	$.snippet(node, () => $$props.children);
	$.reset(span);

	$.template_effect(() => $.set_attribute(span, 'data-tooltip', $$props.shortCut
		? `${$$props.tooltip} (${$$props.shortCut})`
		: $$props.tooltip));

	$.append($$anchor, span);
}