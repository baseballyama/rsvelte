import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { textarea } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'header',
	'footer',
	'addon',
	'value',
	'elementRef',
	'divClass',
	'innerClass',
	'headerClass',
	'footerClass',
	'addonClass',
	'disabled',
	'class',
	'classes',
	'clearable',
	'clearableSvgClass',
	'clearableColor',
	'clearableClass',
	'clearableOnClick',
	'textareaClass'
]);

var root = $.from_html(`<textarea></textarea>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div><!> <div><!> <textarea></textarea></div> <!></div>`);
var root_3 = $.from_html(`<div><!> <!></div>`);

export default function Textarea($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		elementRef = $.prop($$props, 'elementRef', 15),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Textarea",
		untrack(() => ({
			divClass: $$props.divClass,
			innerClass: $$props.innerClass,
			headerClass: $$props.headerClass,
			footerClass: $$props.footerClass,
			addonClass: $$props.addonClass,
			textareaClass: $$props.textareaClass,
			clearableClass: $$props.clearableClass,
			clearableSvgClass: $$props.clearableSvgClass
		})),
		{
			divClass: "div",
			innerClass: "inner",
			headerClass: "header",
			footerClass: "footer",
			addonClass: "addon",
			textareaClass: "class",
			clearableClass: "close",
			clearableSvgClass: "svg"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		div: $$props.divClass,
		inner: $$props.innerClass,
		header: $$props.headerClass,
		footer: $$props.footerClass,
		addon: $$props.addonClass,
		textarea: $$props.textareaClass,
		close: $$props.clearableClass,
		svg: $$props.clearableSvgClass
	});

	const theme = $.derived(() => getTheme("textarea"));
	let hasHeader = $.derived(() => !!$$props.header);
	let hasFooter = $.derived(() => !!$$props.footer);
	let hasAddon = $.derived(() => !!$$props.addon);
	let wrapped = $.derived(() => $.get(hasHeader) || $.get(hasFooter) || $.get(hasAddon));

	const $$d = $.derived(() => textarea({
			wrapped: $.get(wrapped),
			hasHeader: $.get(hasHeader),
			hasFooter: $.get(hasFooter)
		})),
		div = $.derived(() => $.get($$d).div),
		base = $.derived(() => $.get($$d).base),
		wrapper = $.derived(() => $.get($$d).wrapper),
		inner = $.derived(() => $.get($$d).inner),
		headerCls = $.derived(() => $.get($$d).header),
		footerCls = $.derived(() => $.get($$d).footer),
		addonCls = $.derived(() => $.get($$d).addon),
		close = $.derived(() => $.get($$d).close);

	const clearAll = () => {
		if (elementRef()) {
			elementRef(elementRef().value = "", true);
			value(undefined);
		}

		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	createDismissableContext(clearAll);

	var div_1 = root_3();
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var textarea_1 = root();

			$.remove_textarea_child(textarea_1);

			$.attribute_effect(textarea_1, ($0) => ({ disabled: $$props.disabled, ...restProps, class: $0 }), [
				() => $.get(wrapper)({ class: clsx($$props.class, $$props.classes?.wrapper) })
			]);

			$.bind_this(textarea_1, ($$value) => elementRef($$value), () => elementRef());
			$.bind_value(textarea_1, value);
			$.append($$anchor, textarea_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_2();
			var node_1 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var div_3 = root_1();
					var node_2 = $.child(div_3);

					$.snippet(node_2, () => $$props.header);
					$.reset(div_3);

					$.template_effect(($0) => $.set_class(div_3, 1, $0), [
						() => $.clsx($.get(headerCls)({ class: clsx($.get(theme)?.header, $.get(styling).header) }))
					]);

					$.append($$anchor, div_3);
				};

				$.if(node_1, ($$render) => {
					if ($$props.header) $$render(consequent_1);
				});
			}

			var div_4 = $.sibling(node_1, 2);
			var node_3 = $.child(div_4);

			{
				var consequent_2 = ($$anchor) => {
					var div_5 = root_1();
					var node_4 = $.child(div_5);

					$.snippet(node_4, () => $$props.addon);
					$.reset(div_5);

					$.template_effect(($0) => $.set_class(div_5, 1, $0), [
						() => $.clsx($.get(addonCls)({ class: clsx($.get(theme)?.addon, $.get(styling).addon) }))
					]);

					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if ($$props.addon) $$render(consequent_2);
				});
			}

			var textarea_2 = $.sibling(node_3, 2);

			$.remove_textarea_child(textarea_2);

			$.attribute_effect(textarea_2, ($0) => ({ disabled: $$props.disabled, ...restProps, class: $0 }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			$.bind_this(textarea_2, ($$value) => elementRef($$value), () => elementRef());
			$.reset(div_4);

			var node_5 = $.sibling(div_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_1();
					var node_6 = $.child(div_6);

					$.snippet(node_6, () => $$props.footer);
					$.reset(div_6);

					$.template_effect(($0) => $.set_class(div_6, 1, $0), [
						() => $.clsx($.get(footerCls)({ class: clsx($.get(theme)?.footer, $.get(styling).footer) }))
					]);

					$.append($$anchor, div_6);
				};

				$.if(node_5, ($$render) => {
					if ($$props.footer) $$render(consequent_3);
				});
			}

			$.reset(div_2);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_2, 1, $0);
					$.set_class(div_4, 1, $1);
				},
				[
					() => $.clsx($.get(wrapper)({ class: clsx($.get(theme)?.wrapper, $$props.classes?.wrapper) })),
					() => $.clsx($.get(inner)({ class: clsx($.get(theme)?.inner, $.get(styling).inner) }))
				]
			);

			$.bind_value(textarea_2, value);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (!$.get(wrapped)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_7 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
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

		$.if(node_7, ($$render) => {
			if (value() !== undefined && value() !== "" && $$props.clearable) $$render(consequent_4);
		});
	}

	$.reset(div_1);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) }))
	]);

	$.append($$anchor, div_1);
	$.pop();
}