import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { codeVariants } from ".";
import { useCode } from "./code.svelte.js";
import { box } from "svelte-toolbelt";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'lang',
	'code',
	'class',
	'hideLines',
	'highlight',
	'children'
]);

var root = $.from_html(`<div><!> <!></div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	//   import "../../../../app.css";
	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		lang = $.prop($$props, 'lang', 3, "svelte"),
		hideLines = $.prop($$props, 'hideLines', 3, false),
		highlight = $.prop($$props, 'highlight', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	const codeState = useCode({
		code: box.with(() => $$props.code),
		hideLines: box.with(() => hideLines()),
		highlight: box.with(() => highlight()),
		lang: box.with(() => lang())
	});

	var div = root();

	$.attribute_effect(div, ($0) => ({ ...rest, class: $0 }), [
		() => cn(codeVariants({ variant: variant() }), $$props.class)
	]);

	var node = $.child(div);

	$.html(node, () => codeState.highlighted);

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}