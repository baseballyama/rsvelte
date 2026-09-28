import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { hr } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'divClass',
	'innerDivClass',
	'class',
	'classes',
	'divProps',
	'hrProps'
]);

var root = $.from_html(`<div><hr/> <div><!></div></div>`);
var root_1 = $.from_html(`<hr/>`);

export default function Hr($$anchor, $$props) {
	$.push($$props, true);

	let divProps = $.prop($$props, 'divProps', 19, () => ({})),
		hrProps = $.prop($$props, 'hrProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Hr",
		untrack(() => ({
			divClass: $$props.divClass,
			innerDivClass: $$props.innerDivClass
		})),
		{ divClass: "div", innerDivClass: "content" }
	);

	const styling = $.derived(() => $$props.classes ?? { div: $$props.divClass, content: $$props.innerDivClass });
	const theme = $.derived(() => getTheme("hr"));
	const bg = $.derived(() => $$props.classes?.bg ?? "bg-gray-200 dark:bg-gray-700");

	// for backward compatibility and ...restPorps will be removed and use only ..divProps and ...hrProps in future
	const mergedDivProps = $.derived(() => ({ ...restProps, ...divProps() }));

	const mergedHrProps = $.derived(() => ({ ...restProps, ...hrProps() }));

	let $$d = $.derived(() => hr({ withChildren: !!$$props.children })),
		base = $.derived(() => $.get($$d).base),
		div = $.derived(() => $.get($$d).div),
		content = $.derived(() => $.get($$d).content);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.attribute_effect(div_1, ($0) => ({ ...$.get(mergedDivProps), class: $0 }), [
				() => $.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) })
			]);

			var hr_1 = $.child(div_1);

			$.attribute_effect(hr_1, ($0) => ({ ...$.get(mergedHrProps), class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class, $.get(bg)) })
			]);

			var div_2 = $.sibling(hr_1, 2);
			var node_1 = $.child(div_2);

			$.snippet(node_1, () => $$props.children);
			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
			]);

			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var hr_2 = root_1();

			$.attribute_effect(hr_2, ($0) => ({ ...$.get(mergedHrProps), class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class, $.get(bg)) })
			]);

			$.append($$anchor, hr_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}