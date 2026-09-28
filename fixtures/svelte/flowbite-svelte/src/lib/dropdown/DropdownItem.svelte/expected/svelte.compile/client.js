import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getDropdownContext } from "$lib/context";
import { dropdownItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'aClass',
	'children',
	'activeClass',
	'liClass',
	'classes',
	'class',
	'href',
	'onclick'
]);

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<button><!></button>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<li><!></li>`);

export default function DropdownItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"DropdownItem",
		untrack(() => ({
			aClass: $$props.aClass,
			activeClass: $$props.activeClass,
			liClass: $$props.liClass
		})),
		{ aClass: "class", activeClass: "active", liClass: "li" }
	);

	const styling = $.derived(() => $$props.classes ?? { active: $$props.activeClass, li: $$props.liClass });
	const theme = $.derived(() => getTheme("dropdownItem"));
	const ctx = getDropdownContext();
	let isActive = $.derived(() => ctx?.activeUrl && $$props.href ? $$props.href === ctx.activeUrl : false);
	const { base, active, li } = dropdownItem();

	let finalClass = $.derived(() => $.get(isActive)
		? active({ class: clsx($.get(theme)?.active, $.get(styling).active) })
		: base({ class: clsx($.get(theme)?.base, $$props.class) }));

	var li_1 = root_3();
	var node = $.child(li_1);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, () => ({
				href: $$props.href,
				onclick: $$props.onclick,
				...restProps,
				class: $.get(finalClass)
			}));

			var node_1 = $.child(a);

			$.snippet(node_1, () => $$props.children);
			$.reset(a);
			$.append($$anchor, a);
		};

		var consequent_1 = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(button, () => ({
				type: 'button',
				onclick: $$props.onclick,
				...restProps,
				class: $.get(finalClass)
			}));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children);
			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var div = root_2();

			$.attribute_effect(div, () => ({ ...restProps, class: $.get(finalClass) }));

			var node_3 = $.child(div);

			$.snippet(node_3, () => $$props.children);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent); else if ($$props.onclick) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(li_1);
	$.template_effect(($0) => $.set_class(li_1, 1, $0), [() => $.clsx(li({ class: clsx($.get(styling).li) }))]);
	$.append($$anchor, li_1);
	$.pop();
}