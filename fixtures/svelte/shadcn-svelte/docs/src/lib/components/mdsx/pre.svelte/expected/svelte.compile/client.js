import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import CopyButton from "$lib/components/copy-button.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<pre><!></pre> <!>`, 1);

export default function Pre($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let preNode = $.state(void 0);
	let code = $.state("");

	onMount(() => {
		if ($.get(preNode)) {
			$.set(code, $.get(preNode).innerText.trim().replaceAll("  ", " "), true);
		}
	});

	var fragment = root();
	var pre = $.first_child(fragment);

	$.attribute_effect(pre, ($0) => ({ class: $0, ...restProps }), [
		() => cn("no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0", $$props.class)
	]);

	var node = $.child(pre);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(pre);
	$.bind_this(pre, ($$value) => $.set(preNode, $$value), () => $.get(preNode));

	var node_1 = $.sibling(pre, 2);

	CopyButton(node_1, {
		get text() {
			return $.get(code);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}