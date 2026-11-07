import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { FileUpload } from "../builders/FileUpload.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'selected',
	'children',
	'validate',
	'multiple'
]);

export default function FileUpload_1($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.prop($$props, 'selected', 15),
		rest = $.rest_props($$props, rest_excludes);

	const fileUpload = new FileUpload({
		...getters(rest),
		selected: () => selected(),
		onSelectedChange(v) {
			selected(v);
		},
		multiple: () => $$props.multiple
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => fileUpload);
	$.append($$anchor, fragment);
	$.pop();
}