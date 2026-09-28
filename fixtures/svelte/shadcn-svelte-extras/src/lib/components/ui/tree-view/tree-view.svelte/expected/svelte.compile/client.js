import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<div role="tree"><!></div>`);

export default function Tree_view($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('flex flex-col', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}