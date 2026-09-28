import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { search } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'inputClass',
	'size',
	'placeholder',
	'value',
	'elementRef',
	'clearable',
	'clearableSvgClass',
	'clearableColor',
	'clearableClass',
	'clearableOnClick',
	'class',
	'classes'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><div><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"></path></svg></div> <input/> <!> <!></div>`);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 3, "Search"),
		value = $.prop($$props, 'value', 15),
		elementRef = $.prop($$props, 'elementRef', 15),
		clearable = $.prop($$props, 'clearable', 3, false),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Search",
		untrack(() => ({
			inputClass: $$props.inputClass,
			clearableSvgClass: $$props.clearableSvgClass,
			clearableClass: $$props.clearableClass
		})),
		{
			inputClass: "input",
			clearableSvgClass: "svg",
			clearableClass: "close"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		input: $$props.inputClass,
		svg: $$props.clearableSvgClass,
		close: $$props.clearableClass
	});

	const theme = $.derived(() => getTheme("search"));

	const $$d = $.derived(() => search({ size: $$props.size })),
		base = $.derived(() => $.get($$d).base),
		content = $.derived(() => $.get($$d).content),
		icon = $.derived(() => $.get($$d).icon),
		close = $.derived(() => $.get($$d).close),
		inputCls = $.derived(() => $.get($$d).input),
		left = $.derived(() => $.get($$d).left);

	const clearAll = () => {
		if (elementRef()) {
			elementRef(elementRef().value = "", true);
			value(undefined);
		}

		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	createDismissableContext(clearAll);

	var div = root_1();
	var div_1 = $.child(div);
	var svg = $.only_child(div_1);
	var input = $.sibling(div_1, 2);

	$.attribute_effect(
		input,
		($0) => ({
			type: 'search',
			class: $0,
			placeholder: placeholder(),
			required: true,
			...restProps
		}),
		[
			() => $.get(inputCls)({ class: clsx($.get(theme)?.input, $.get(styling).input) })
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => elementRef($$value), () => elementRef());

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			$.snippet(node_1, () => $$props.children);
			$.reset(div_2);

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) }))
			]);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(close)({ class: clsx($.get(theme)?.close, $.get(styling).close) }));
				let $1 = $.derived(() => clsx($.get(styling).svg));

				CloseButton($$anchor, {
					get class() {
						return $.get($0);
					},

					get color() {
						return clearableColor();
					},
					'aria-label': 'Clear search value',
					get svgClass() {
						return $.get($1);
					}
				});
			}
		};

		$.if(node_2, ($$render) => {
			if (value() !== undefined && value() !== "" && clearable()) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
			$.set_class(svg, 0, $2);
		},
		[
			() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })),
			() => $.clsx($.get(left)({ class: clsx($.get(theme)?.left, $$props.classes?.left) })),
			() => $.clsx($.get(icon)({ class: clsx($.get(theme)?.icon, $$props.classes?.icon) }))
		]
	);

	$.bind_value(input, value);
	$.append($$anchor, div);
	$.pop();
}