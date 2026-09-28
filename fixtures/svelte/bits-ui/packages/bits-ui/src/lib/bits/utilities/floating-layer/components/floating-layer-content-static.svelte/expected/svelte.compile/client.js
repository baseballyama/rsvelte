import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

export default function Floating_layer_content_static($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		$$props.onPlaced?.();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.content ?? $.noop, () => ({ props: {}, wrapperProps: {} }));
	$.append($$anchor, fragment);
	$.pop();
}