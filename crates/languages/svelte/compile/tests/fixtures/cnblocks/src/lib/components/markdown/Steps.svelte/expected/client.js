import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<div><!></div>`);

export default function Steps($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("relative mb-12 ml-4 border-l border-border [counter-reset:step]", $$props.class))
	]);

	$.append($$anchor, div);
	$.pop();
}