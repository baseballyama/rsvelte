import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { select as selectCls } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { getButtonGroupContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'items',
	'value',
	'elementRef',
	'underline',
	'size',
	'disabled',
	'placeholder',
	'clearable',
	'clearableColor',
	'clearableOnClick',
	'onClear',
	'clearableSvgClass',
	'clearableClass',
	'selectClass',
	'class',
	'classes'
]);

var root = $.from_html(`<option disabled=""> </option>`);
var root_1 = $.from_html(`<option> </option>`);
var select_content = $.from_html(`<!><!><!>`, 1);
var root_2 = $.from_html(`<div><select><!></select> <!></div>`);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		elementRef = $.prop($$props, 'elementRef', 15),
		size = $.prop($$props, 'size', 3, "md"),
		placeholder = $.prop($$props, 'placeholder', 3, "Choose option ..."),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Select",
		untrack(() => ({
			selectClass: $$props.selectClass,
			clearableSvgClass: $$props.clearableSvgClass,
			clearableClass: $$props.clearableClass
		})),
		{
			selectClass: "select",
			clearableSvgClass: "svg",
			clearableClass: "close"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		select: $$props.selectClass,
		svg: $$props.clearableSvgClass,
		close: $$props.clearableClass
	});

	const theme = $.derived(() => getTheme("select"));
	const group = getButtonGroupContext();

	const $$d = $.derived(() => selectCls({
			underline: $$props.underline,
			size: size(),
			disabled: $$props.disabled,
			grouped: !!group
		})),
		base = $.derived(() => $.get($$d).base),
		select = $.derived(() => $.get($$d).select),
		close = $.derived(() => $.get($$d).close);

	const clearAll = () => {
		if (elementRef()) {
			// Set to empty string to show placeholder and trigger change event
			elementRef(elementRef().value = "", true);

			// Dispatch a synthetic change event to notify listeners
			elementRef().dispatchEvent(new Event("change", { bubbles: true }));
		}

		// Set reactive value to empty string to match placeholder option
		value("");

		// Support both old and new callback names for backward compatibility
		if ($$props.onClear) $$props.onClear();

		// remove this in next major version
		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	createDismissableContext(clearAll);

	var div = root_2();
	var select_1 = $.child(div);

	$.attribute_effect(select_1, ($0) => ({ disabled: $$props.disabled, ...restProps, class: $0 }), [
		() => $.get(select)({ class: clsx($.get(theme)?.select, $.get(styling).select) })
	]);

	$.customizable_select(select_1, () => {
		var anchor = $.child(select_1);
		var fragment = select_content();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var option = root();
				var text = $.only_child(option, true);

				option.value = option.__value = '';

				$.template_effect(() => {
					$.set_selected(option, value() === "" || value() === undefined);
					$.set_text(text, placeholder());
				});

				$.append($$anchor, option);
			};

			$.if(node, ($$render) => {
				if (placeholder()) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.each(node_2, 17, () => $$props.items, (item) => item.value, ($$anchor, item) => {
					var option_1 = root_1();
					var text_1 = $.only_child(option_1, true);
					var option_1_value = {};

					$.template_effect(() => {
						option_1.disabled = $.get(item).disabled;
						$.set_text(text_1, $.get(item).name);

						if (option_1_value !== (option_1_value = $.get(item).value)) {
							option_1.value = (option_1.__value = option_1_value) ?? '';
						}
					});

					$.append($$anchor, option_1);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if ($$props.items) $$render(consequent_1);
			});
		}

		var node_3 = $.sibling(node_1);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				$.snippet(node_4, () => $$props.children);
				$.append($$anchor, fragment_2);
			};

			$.if(node_3, ($$render) => {
				if ($$props.children) $$render(consequent_2);
			});
		}

		$.append(anchor, fragment);
	});

	$.bind_this(select_1, ($$value) => elementRef($$value), () => elementRef());

	var node_5 = $.sibling(select_1, 2);

	{
		var consequent_3 = ($$anchor) => {
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
					},

					get disabled() {
						return $$props.disabled;
					}
				});
			}
		};

		$.if(node_5, ($$render) => {
			if (value() !== undefined && value() !== "" && $$props.clearable) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }))
	]);

	$.bind_select_value(select_1, value);
	$.append($$anchor, div);
	$.pop();
}