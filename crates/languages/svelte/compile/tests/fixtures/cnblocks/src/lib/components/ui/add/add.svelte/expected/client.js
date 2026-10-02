import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useAdd } from "./add.svelte.js";
import { box } from "svelte-toolbelt";

export default function Add($$anchor, $$props) {
	$.push($$props, true);

	let withoutRegistry = $.prop($$props, 'withoutRegistry', 3, false);

	useAdd({
		item: box.with(() => $$props.item),
		withoutRegistry: box.with(() => withoutRegistry())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}