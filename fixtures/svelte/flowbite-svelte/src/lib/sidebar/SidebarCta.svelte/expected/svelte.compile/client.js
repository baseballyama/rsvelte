import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { sidebarCta } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'divClass',
	'spanClass',
	'label',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div><span> </span> <!></div> <!></div>`);

export default function SidebarCta($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("SidebarCta", untrack(() => ({ divClass: $$props.divClass, spanClass: $$props.spanClass })), { divClass: "div", spanClass: "span" });

	const styling = $.derived(() => $$props.classes ?? { div: $$props.divClass, span: $$props.spanClass });
	const theme = $.derived(() => getTheme("sidebarCta"));

	const $$d = $.derived(sidebarCta),
		base = $.derived(() => $.get($$d).base),
		div = $.derived(() => $.get($$d).div),
		span = $.derived(() => $.get($$d).span);

	var div_1 = root();

	$.attribute_effect(div_1, ($0) => ({ ...restProps, id: 'dropdown-cta', class: $0, role: 'alert' }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var div_2 = $.child(div_1);
	var span_1 = $.child(div_2);
	var text = $.only_child(span_1, true);
	var node = $.sibling(span_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.icon);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(div_1);

	$.template_effect(
		($0, $1) => {
			$.set_class(div_2, 1, $0);
			$.set_class(span_1, 1, $1);
			$.set_text(text, $$props.label);
		},
		[
			() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) })),
			() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
		]
	);

	$.append($$anchor, div_1);
	$.pop();
}