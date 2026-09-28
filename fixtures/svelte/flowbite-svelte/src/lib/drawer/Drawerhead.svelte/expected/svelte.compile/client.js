import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { drawerhead } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'closeIcon',
	'children',
	'buttonClass',
	'svgClass',
	'class',
	'classes'
]);

var root = $.from_html(`<button><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path></svg> <span class="sr-only">Close drawer</span></button>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Drawerhead($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Drawerhead", untrack(() => ({ buttonClass: $$props.buttonClass, svgClass: $$props.svgClass })), { buttonClass: "button", svgClass: "svg" });

	const styling = $.derived(() => $$props.classes ?? { button: $$props.buttonClass, svg: $$props.svgClass });
	const theme = $.derived(() => getTheme("drawer"));

	const $$d = $.derived(drawerhead),
		base = $.derived(() => $.get($$d).base),
		button = $.derived(() => $.get($$d).button),
		svg = $.derived(() => $.get($$d).svg);

	var div = root_1();
	var node = $.child(div);

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

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.snippet(node_3, () => $$props.closeIcon);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var button_1 = root();

			$.attribute_effect(button_1, ($0) => ({ type: 'button', ...restProps, class: $0 }), [() => $.get(button)({ class: clsx($.get(styling).button) })]);

			var svg_1 = $.child(button_1);

			$.next(2);
			$.reset(button_1);

			$.template_effect(($0) => $.set_class(svg_1, 0, $0), [
				() => $.clsx($.get(svg)({ class: clsx($.get(styling).svg) }))
			]);

			$.append($$anchor, button_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.closeIcon) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }))
	]);

	$.append($$anchor, div);
	$.pop();
}