import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<div><!></div>`);

export default function TreeView($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cls('flex flex-col', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}