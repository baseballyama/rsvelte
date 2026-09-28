import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "./CheckIcon.svelte";
import { buttonToggle } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { getButtonToggleContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'selected',
	'children',
	'iconSlot',
	'color',
	'class',
	'iconClass',
	'txtClass',
	'contentClass',
	'classes'
]);

var root = $.from_html(`<button><div><!> <span><!></span></div></button>`);

export default function ButtonToggle($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.prop($$props, 'selected', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"ButtonToggle",
		untrack(() => ({
			iconClass: $$props.iconClass,
			txtClass: $$props.txtClass,
			contentClass: $$props.contentClass
		})),
		{ iconClass: "icon", txtClass: "text", contentClass: "content" }
	);

	// button(className), content, text, icon
	const styling = $.derived(() => $$props.classes ?? {
		icon: $$props.iconClass,
		text: $$props.txtClass,
		content: $$props.contentClass
	});

	const theme = $.derived(() => getTheme("buttonToggle"));

	// Get context - it will be undefined if used outside ButtonToggleGroup
	const ctx = getButtonToggleContext();

	// Extract context values with fallbacks
	const {
		toggleSelected,
		isSelected,
		multiSelect,
		size,
		roundedSize,
		ctxIconClass,
		ctxBtnClass
	} = {
		toggleSelected: ctx?.toggleSelected ?? (() => {}),
		isSelected: ctx?.isSelected ?? (() => false),
		multiSelect: ctx?.multiSelect ?? false,
		size: ctx?.size,
		roundedSize: ctx?.roundedSize,
		ctxIconClass: ctx?.ctxIconClass,
		ctxBtnClass: ctx?.ctxBtnClass
	};

	// Use context color if available, otherwise use prop color, otherwise default to "primary"
	const actualColor = $.derived(() => ctx?.color ?? $$props.color ?? "primary");

	const actualIconClass = ctxIconClass;

	// Filter size to only valid buttonToggle sizes (no 'xs')
	const actualSize = size === "xs" ? "sm" : size;

	// roundedSize is already validated by type system
	const actualRoundedSize = roundedSize;

	function handleClick() {
		toggleSelected($$props.value);
	}

	const $$d = $.derived(() => buttonToggle({
			selected: selected(),
			color: $.get(actualColor),
			size: actualSize
		})),
		button = $.derived(() => $.get($$d).button),
		content = $.derived(() => $.get($$d).content),
		text = $.derived(() => $.get($$d).text),
		icon = $.derived(() => $.get($$d).icon);

	$.user_effect(() => {
		selected(isSelected($$props.value));
	});

	var button_1 = root();

	$.attribute_effect(
		button_1,
		($0) => ({
			type: 'button',
			class: $0,
			'data-selected': selected(),
			onclick: handleClick,
			role: multiSelect ? "checkbox" : "radio",
			'aria-checked': selected(),
			...restProps
		}),
		[
			() => $.get(button)({
				selected: selected(),
				color: $.get(actualColor),
				size: actualSize,
				roundedSize: actualRoundedSize,
				class: clsx($.get(theme)?.button, ctxBtnClass, $$props.class)
			})
		]
	);

	var div = $.child(button_1);
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.iconSlot);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(icon)({
							class: clsx($.get(theme)?.icon ?? actualIconClass, $.get(styling).icon)
						}));

						CheckIcon($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if ($$props.iconSlot) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (selected()) $$render(consequent_1);
		});
	}

	var span = $.sibling(node, 2);
	var node_3 = $.child(span);

	$.snippet(node_3, () => $$props.children);
	$.reset(span);
	$.reset(div);
	$.reset(button_1);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_class(span, 1, $1);
		},
		[
			() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) })),
			() => $.clsx($.get(text)({
				selected: selected(),
				class: clsx($.get(theme)?.text, $.get(styling).text)
			}))
		]
	);

	$.append($$anchor, button_1);
	$.pop();
}