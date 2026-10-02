import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<div><div><!></div></div>`);

export default function Integration_cardv5($$anchor, $$props) {
	$.push($$props, true);

	let _class = $.prop($$props, 'class', 3, ""),
		isCenter = $.prop($$props, 'isCenter', 3, false);

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
		},
		[
			() => $.clsx(cn("relative z-30 flex size-12 rounded-full border bg-white shadow-sm shadow-black/5 dark:bg-white/5 dark:backdrop-blur-md", _class())),
			() => $.clsx(cn("m-auto size-fit *:size-5", isCenter() && "*:size-8"))
		]
	);

	$.append($$anchor, div);
	$.pop();
}