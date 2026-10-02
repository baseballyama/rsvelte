import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);

var root = $.from_html(`<pre>
	<!>
</pre>`);

export default function Pre($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var pre = root();

	$.attribute_effect(pre, ($0) => ({ class: $0, ...restProps }), [
		() => cn("rounded-card border-muted relative mb-4 mt-6 overflow-x-auto border-2 py-8", $$props.class)
	]);

	var node = $.sibling($.child(pre));

	$.snippet(node, () => $$props.children ?? $.noop);
	$.next();
	$.reset(pre);
	$.append($$anchor, pre);
	$.pop();
}