import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { android } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'classes',
	'divClass',
	'div2Class',
	'div3Class',
	'div4Class',
	'div5Class',
	'div6Class',
	'div7Class'
]);

var root = $.from_html(`<div><div></div> <div></div> <div></div> <div></div> <div></div> <div><!></div></div>`);

export default function Android($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Android",
		untrack(() => ({
			divClass: $$props.divClass,
			div2Class: $$props.div2Class,
			div3Class: $$props.div3Class,
			div4Class: $$props.div4Class,
			div5Class: $$props.div5Class,
			div6Class: $$props.div6Class,
			div7Class: $$props.div7Class
		})),
		{
			divClass: "class",
			div2Class: "top",
			div3Class: "leftTop",
			div4Class: "leftMid",
			div5Class: "leftBot",
			div6Class: "right",
			div7Class: "slot"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		top: $$props.div2Class,
		leftTop: $$props.div3Class,
		leftMid: $$props.div4Class,
		leftBot: $$props.div5Class,
		right: $$props.div6Class,
		slot: $$props.div7Class
	});

	const { base, slot, top, leftTop, leftMid, leftBot, right } = android();
	var div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => base({ class: clsx($$props.class ?? $$props.divClass) })
	]);

	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var node = $.child(div_6);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div_6);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_class(div_1, 1, $0);
			$.set_class(div_2, 1, $1);
			$.set_class(div_3, 1, $2);
			$.set_class(div_4, 1, $3);
			$.set_class(div_5, 1, $4);
			$.set_class(div_6, 1, $5);
		},
		[
			() => $.clsx(top({ class: clsx($.get(styling).top) })),
			() => $.clsx(leftTop({ class: clsx($.get(styling).leftTop) })),
			() => $.clsx(leftMid({ class: clsx($.get(styling).leftMid) })),
			() => $.clsx(leftBot({ class: clsx($.get(styling).leftBot) })),
			() => $.clsx(right({ class: clsx($.get(styling).right) })),
			() => $.clsx(slot({ class: clsx($.get(styling).slot) }))
		]
	);

	$.append($$anchor, div);
	$.pop();
}