import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function ControlGroup($$anchor, $$props) {
	let classNames = $.prop($$props, 'class', 3, '');
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `maplibregl-ctrl-group ${classNames() ?? ''}`));
	$.append($$anchor, div);
}