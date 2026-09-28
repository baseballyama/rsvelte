import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { desktop } from "./theme";
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

var root = $.from_html(`<div><div><!></div></div> <div></div> <div></div>`, 1);

export default function Desktop($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Desktop",
		untrack(() => ({
			divClass: $$props.divClass,
			div2Class: $$props.div2Class,
			div3Class: $$props.div3Class,
			div4Class: $$props.div4Class
		})),
		{
			divClass: "class",
			div2Class: "inner",
			div3Class: "bot",
			div4Class: "botUnder"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		inner: $$props.div2Class,
		bot: $$props.div3Class,
		botUnder: $$props.div4Class
	});

	const { base, inner, bot, botUnder } = desktop();
	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => base({ class: clsx($$props.class ?? $$props.divClass) })
	]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.sibling(div_2, 2);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(div_1, 1, $0);
			$.set_class(div_2, 1, $1);
			$.set_class(div_3, 1, $2);
		},
		[
			() => $.clsx(inner({ class: clsx($.get(styling).inner) })),
			() => $.clsx(bot({ class: clsx($.get(styling).bot) })),
			() => $.clsx(botUnder({ class: clsx($.get(styling).botUnder) }))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}