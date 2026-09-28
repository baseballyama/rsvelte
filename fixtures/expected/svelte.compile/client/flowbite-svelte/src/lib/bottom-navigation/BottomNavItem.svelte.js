import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getBottomNavContext } from "$lib/context";
import { bottomNavItem } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'btnName',
	'appBtnPosition',
	'activeClass',
	'class',
	'classes',
	'btnClass',
	'spanClass',
	'active'
]);

var root = $.from_html(`<button><!> <span> </span></button>`);
var root_1 = $.from_html(`<a><!> <span> </span></a>`);

export default function BottomNavItem($$anchor, $$props) {
	$.push($$props, true);

	let appBtnPosition = $.prop($$props, 'appBtnPosition', 3, "middle"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("BottomNavItem", untrack(() => ({ spanClass: $$props.spanClass, btnClass: $$props.btnClass })), { spanClass: "span", btnClass: "class" });

	const styling = $.derived(() => $$props.classes ?? { span: $$props.spanClass });

	// Theme context
	const theme = $.derived(() => getTheme("bottomNavItem"));

	const context = getBottomNavContext();
	let navUrl = $.derived(() => context?.activeUrl || "");

	const $$d = $.derived(() => bottomNavItem({ navType: context?.navType, appBtnPosition: appBtnPosition() })),
		base = $.derived(() => $.get($$d).base),
		span = $.derived(() => $.get($$d).span);

	// Determine active state based on manual prop or URL matching
	let isActive = $.derived(() => {
		const href = $$props.href ?? "";

		return $$props.active !== undefined
			? !!$$props.active
			: $.get(navUrl)
				? href === "/"
					? $.get(navUrl) === "/"
					: href && ($.get(navUrl) === href || $.get(navUrl).startsWith(href + "/") || href !== "/" && $.get(navUrl).replace(/^https?:\/\/[^/]+/, "").startsWith(href))
				: false;
	});

	function getCommonClass() {
		return $.get(base)({
			class: clsx($.get(isActive) && ($$props.activeClass ?? context?.activeClass), $.get(theme)?.base, $$props.class ?? $$props.btnClass)
		});
	}

	function getSpanClass() {
		return $.get(span)({
			class: clsx($.get(isActive) && ($$props.activeClass ?? context?.activeClass), $.get(theme)?.span, $.get(styling).span)
		});
	}

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	const commonProps = $.derived(() => ({
		"aria-label": $$props.btnName,
		class: getCommonClass(),
		...restProps
	}));

	const anchorProps = $.derived(() => ({ ...$.get(commonProps) }));
	const buttonProps = $.derived(() => ({ ...$.get(commonProps), type: "button" }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(buttonProps) }));

			var node_1 = $.child(button);

			$.snippet(node_1, () => $$props.children);

			var span_1 = $.sibling(node_1, 2);
			var text = $.only_child(span_1, true);

			$.reset(button);

			$.template_effect(
				($0) => {
					$.set_class(span_1, 1, $0);
					$.set_text(text, $$props.btnName);
				},
				[() => $.clsx(getSpanClass())]
			);

			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var a = root_1();

			$.attribute_effect(a, () => ({ ...$.get(anchorProps) }));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children);

			var span_2 = $.sibling(node_2, 2);
			var text_1 = $.only_child(span_2, true);

			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_class(span_2, 1, $0);
					$.set_text(text_1, $$props.btnName);
				},
				[() => $.clsx(getSpanClass())]
			);

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.href === undefined) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}