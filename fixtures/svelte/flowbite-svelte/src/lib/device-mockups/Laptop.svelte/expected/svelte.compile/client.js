import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { laptop } from "./theme";
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
	'div4Class'
]);

var root = $.from_html(`<div><div><div><!></div></div> <div><div></div></div></div>`);

export default function Laptop($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Laptop",
		untrack(() => ({
			divClass: $$props.divClass,
			div2Class: $$props.div2Class,
			div3Class: $$props.div3Class,
			div4Class: $$props.div4Class
		})),
		{
			divClass: "class",
			div2Class: "top",
			div3Class: "lefttop",
			div4Class: "leftBot",
			div5Class: "right",
			div6Class: "slot"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		inner: $$props.div2Class,
		bot: $$props.div3Class,
		botCen: $$props.div4Class
	});

	const { base, inner, bot, botCen } = laptop();
	var div = root();

	$.attribute_effect(div, () => ({ ...restProps }));

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

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

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.only_child(div_3);

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_class(div_1, 1, $0);
			$.set_class(div_2, 1, $1);
			$.set_class(div_3, 1, $2);
			$.set_class(div_4, 1, $3);
		},
		[
			() => $.clsx(base({ class: clsx($$props.class ?? $$props.divClass) })),
			() => $.clsx(inner({ class: clsx($.get(styling).inner) })),
			() => $.clsx(bot({ class: clsx($.get(styling).bot) })),
			() => $.clsx(botCen({ class: clsx($.get(styling).botCen) }))
		]
	);

	$.append($$anchor, div);
	$.pop();
}