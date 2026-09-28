import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setBottomNavContext } from "$lib/context";
import { bottomNav } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'header',
	'position',
	'navType',
	'class',
	'classes',
	'outerClass',
	'innerClass',
	'activeClass',
	'activeUrl'
]);

var root = $.from_html(`<div><!> <div><!></div></div>`);

export default function BottomNav($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "fixed"),
		navType = $.prop($$props, 'navType', 3, "default"),
		activeUrl = $.prop($$props, 'activeUrl', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"BottomNav",
		untrack(() => ({
			innerClass: $$props.innerClass,
			outerClass: $$props.outerClass
		})),
		{ innerClass: "inner", outerClass: "class" }
	);

	const styling = $.derived(() => $$props.classes ?? { inner: $$props.innerClass });

	// Theme context
	const theme = $.derived(() => getTheme("bottomNav"));

	const activeCls = $.derived(() => cn("text-primary-700 dark:text-primary-700 hover:text-primary-900 dark:hover:text-primary-900", $$props.activeClass));

	// Create reactive context using getters
	const reactiveCtx = {
		get activeClass() {
			return $.get(activeCls);
		},

		get activeUrl() {
			return activeUrl();
		},

		get navType() {
			return navType();
		}
	};

	setBottomNavContext(reactiveCtx);

	const $$d = $.derived(() => bottomNav({ position: position(), navType: navType() })),
		base = $.derived(() => $.get($$d).base),
		inner = $.derived(() => $.get($$d).inner);

	var div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({
			class: clsx($.get(theme)?.base, $$props.class ?? $$props.outerClass)
		})
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.header);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var node_2 = $.child(div_1);

	$.snippet(node_2, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(inner)({ class: clsx($.get(theme)?.inner, $.get(styling).inner) }))
	]);

	$.append($$anchor, div);
	$.pop();
}