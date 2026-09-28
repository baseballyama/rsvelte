import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import clsx from "clsx";
import { getButtonGroupContext } from "$lib/context";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { input } from "./theme";
import { clampSize } from "./index";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'left',
	'right',
	'value',
	'elementRef',
	'clearable',
	'size',
	'color',
	'class',
	'classes',
	'wrapperClass',
	'leftClass',
	'rightClass',
	'divClass',
	'clearableSvgClass',
	'clearableColor',
	'clearableClass',
	'clearableOnClick',
	'data',
	'maxSuggestions',
	'onSelect',
	'comboClass',
	'comboItemClass',
	'onInput',
	'onFocus',
	'onBlur',
	'onKeydown',
	'oninput',
	'onfocus',
	'onblur',
	'onkeydown'
]);

var root = $.from_html(`<input/> <!>`, 1);
var root_1 = $.from_html(`<div tabindex="-1" class="sr-only"></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<button type="button"><p> </p></button>`);
var root_4 = $.from_html(`<div></div>`);
var root_5 = $.from_html(`<div><!> <!> <!> <!></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const // onSelect is a custom combobox selection handler that takes a string
	// standard DOM events, onInput, onFocus, onBlur, onKeydown will be deprecated in the next minor version
	// Automatically enable combobox when data is provided
	// tinted if put in component having its own background
	// svelte-ignore non_reactive_update
	// in order to avoid type error in setTimeout()
	// hack to focus outside
	// Combobox functionality
	// Track if backspace was used to clear
	// Show suggestions if:
	// 1. There's actual input text, OR
	// 2. The input is empty but backspace was just used to clear it
	// If there's text, filter suggestions
	// If empty but backspace was used, show all suggestions
	// Watch for value changes
	// Ensure value is treated as a string to safely check its length
	// Small delay to allow click on suggestion to fire first
	// Reset flag when focus is lost
	// Special handling for backspace/delete - track when it's used to clear the input
	// If this keypress will make the input empty
	// Combined event handlers that call custom handlers first, then default behavior
	// Replace the whole value if no space, add trailing space
	// Replace last word, add trailing space
	inputContent = ($$anchor, wrapped = $.noop) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => ({ ...restProps, class: $.get(inputCls)() }));

					$.snippet(node_1, () => $$props.children, () => $.get($0));
				}

				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var fragment_2 = root();
				var input_1 = $.first_child(fragment_2);

				$.attribute_effect(
					input_1,
					($0) => ({
						...restProps,
						oninput: handleInput,
						onfocus: handleFocus,
						onblur: handleBlur,
						onkeydown: handleKeydown,
						class: $0
					}),
					[
						() => [
							wrapped() || $.get(base)(),
							$.get(inputCls)({ class: clsx($.get(theme)?.input, $$props.class) })
						]
					],
					void 0,
					void 0,
					void 0,
					true
				);

				$.bind_this(input_1, ($$value) => elementRef($$value), () => elementRef());

				var node_2 = $.sibling(input_1, 2);

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

				$.bind_value(input_1, value);
				$.append($$anchor, fragment_2);
			};

			$.if(node, ($$render) => {
				if ($$props.children) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let value = $.prop($$props, 'value', 15),
		elementRef = $.prop($$props, 'elementRef', 15),
		clearable = $.prop($$props, 'clearable', 3, false),
		color = $.prop($$props, 'color', 3, "default"),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		data = $.prop($$props, 'data', 19, () => []),
		maxSuggestions = $.prop($$props, 'maxSuggestions', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Input",
		untrack(() => ({
			wrapperClass: $$props.wrapperClass,
			leftClass: $$props.leftClass,
			rightClass: $$props.rightClass,
			divClass: $$props.divClass,
			clearableSvgClass: $$props.clearableSvgClass,
			clearableClass: $$props.clearableClass,
			comboClass: $$props.comboClass
		})),
		{
			wrapperClass: "wrapper",
			leftClass: "left",
			rightClass: "right",
			divClass: "div",
			clearableSvgClass: "svg",
			clearableClass: "close",
			comboClass: "comboItem"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		left: $$props.leftClass,
		right: $$props.rightClass,
		div: $$props.divClass,
		svg: $$props.clearableSvgClass,
		close: $$props.clearableClass,
		combo: $$props.comboClass,
		comboItem: $$props.comboItemClass
	});

	const theme = $.derived(() => getTheme("input"));
	const resolvedOnInput = $.derived(() => $$props.oninput || $$props.onInput);
	const resolvedOnFocus = $.derived(() => $$props.onfocus || $$props.onFocus);
	const resolvedOnBlur = $.derived(() => $$props.onblur || $$props.onBlur);
	const resolvedOnKeydown = $.derived(() => $$props.onkeydown || $$props.onKeydown);
	const isCombobox = $.derived(() => Array.isArray(data()) && data().length > 0);
	let background = getContext("background");
	let dummyFocusDiv;
	let group = $.derived(getButtonGroupContext);
	let isGroup = $.derived(() => !!$.get(group));
	let _size = $.derived(() => $$props.size || ($.get(group)?.size ? clampSize($.get(group).size) : undefined) || "md");
	const _color = $.derived(() => color() === "default" && background ? "tinted" : color());

	const $$d = $.derived(() => input({
			size: $.get(_size),
			color: $.get(_color),
			grouped: $.get(isGroup)
		})),
		base = $.derived(() => $.get($$d).base),
		inputCls = $.derived(() => $.get($$d).input),
		leftCls = $.derived(() => $.get($$d).left),
		rightCls = $.derived(() => $.get($$d).right),
		close = $.derived(() => $.get($$d).close),
		combo = $.derived(() => $.get($$d).combo),
		comboItem = $.derived(() => $.get($$d).comboItem);

	const clearAll = () => {
		if (elementRef()) {
			// in order to avoid type error in setTimeout()
			const input = elementRef();

			input.value = "";
			value("");
			$.set(backspaceUsed, false);
			updateSuggestions();

			// hack to focus outside
			dummyFocusDiv?.focus();

			setTimeout(
				() => {
					input.focus();
				},
				100
			);
		}

		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	createDismissableContext(clearAll);

	// Combobox functionality
	let isFocused = $.state(false);

	let filteredSuggestions = $.state($.proxy([]));
	let selectedIndex = $.state(-1);
	let backspaceUsed = $.state(false // Track if backspace was used to clear
	);

	function updateSuggestions() {
		if (!$.get(isCombobox) || !$.get(isFocused)) {
			$.set(filteredSuggestions, [], true);

			return;
		}

		const fullSearchTerm = (value() || "").toLowerCase();
		const lastSpaceIndex = fullSearchTerm.lastIndexOf(" ");

		const searchTerm = lastSpaceIndex === -1
			? fullSearchTerm
			: fullSearchTerm.substring(lastSpaceIndex + 1);

		// Show suggestions if:
		// 1. There's actual input text, OR
		// 2. The input is empty but backspace was just used to clear it
		if (searchTerm === "" && !$.get(backspaceUsed)) {
			$.set(filteredSuggestions, [], true);
		} else {
			// If there's text, filter suggestions
			if (searchTerm) {
				$.set(filteredSuggestions, data().filter((item) => item.toLowerCase().includes(searchTerm)).slice(0, maxSuggestions()), true);
			} else // If empty but backspace was used, show all suggestions
			if ($.get(backspaceUsed)) {
				$.set(filteredSuggestions, [...data()].slice(0, maxSuggestions()), true);
			}
		}

		$.set(selectedIndex, -1);
	}

	// Watch for value changes
	$.user_effect(() => {
		if ($.get(isCombobox)) {
			updateSuggestions();
		}
	});

	function defaultHandleInput(_event) {
		// Ensure value is treated as a string to safely check its length
		const currentValueAsString = String(value() || "");

		if (currentValueAsString.length > 0) {
			$.set(backspaceUsed, false);
		}

		updateSuggestions();
	}

	function defaultHandleFocus() {
		$.set(isFocused, true);
		updateSuggestions();
	}

	function defaultHandleBlur() {
		// Small delay to allow click on suggestion to fire first
		setTimeout(
			() => {
				$.set(isFocused, false);
				$.set(backspaceUsed, false // Reset flag when focus is lost
				);
				$.set(filteredSuggestions, [], true);
			},
			200
		);
	}

	function defaultHandleKeydown(event) {
		if (!$.get(isCombobox)) return;

		// Special handling for backspace/delete - track when it's used to clear the input
		if (event.key === "Backspace" || event.key === "Delete") {
			const currentValue = value();

			// If this keypress will make the input empty
			if (currentValue.length <= 1) {
				$.set(backspaceUsed, true);
			}
		}

		if (!$.get(filteredSuggestions).length) return;

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				$.set(selectedIndex, ($.get(selectedIndex) + 1) % $.get(filteredSuggestions).length);
				break;

			case "ArrowUp":
				event.preventDefault();
				$.set(
					selectedIndex,
					$.get(selectedIndex) <= 0
						? $.get(filteredSuggestions).length - 1
						: $.get(selectedIndex) - 1,
					true
				);
				break;

			case "Enter":
				if ($.get(selectedIndex) >= 0) {
					event.preventDefault();
					selectItem($.get(filteredSuggestions)[$.get(selectedIndex)]);
				}
				break;

			case "Escape":
				event.preventDefault();
				$.set(filteredSuggestions, [], true);
				break;
		}
	}

	// Combined event handlers that call custom handlers first, then default behavior
	function handleInput(event) {
		if ($.get(resolvedOnInput)) {
			$.get(resolvedOnInput)(event);
		}

		defaultHandleInput(event);
	}

	function handleFocus(event) {
		if ($.get(resolvedOnFocus)) {
			$.get(resolvedOnFocus)(event);
		}

		defaultHandleFocus();
	}

	function handleBlur(event) {
		if ($.get(resolvedOnBlur)) {
			$.get(resolvedOnBlur)(event);
		}

		defaultHandleBlur();
	}

	function handleKeydown(event) {
		if ($.get(resolvedOnKeydown)) {
			$.get(resolvedOnKeydown)(event);
		}

		defaultHandleKeydown(event);
	}

	function selectItem(item) {
		const currentValue = value() || "";
		const lastSpaceIndex = currentValue.lastIndexOf(" ");

		if (lastSpaceIndex === -1) {
			value(item + " " // Replace the whole value if no space, add trailing space
			);
		} else {
			value(currentValue.substring(0, lastSpaceIndex + 1) + item + " " // Replace last word, add trailing space
			);
		}

		if ($$props.onSelect) {
			$$props.onSelect(item);
		}

		$.set(filteredSuggestions, [], true);
		$.set(selectedIndex, -1);

		if (elementRef()) {
			elementRef().focus();
		}
	}

	var fragment_4 = root_6();
	var node_3 = $.first_child(fragment_4);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();

			$.bind_this(div, ($$value) => dummyFocusDiv = $$value, () => dummyFocusDiv);
			$.append($$anchor, div);
		};

		$.if(node_3, ($$render) => {
			if (clearable()) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_1 = root_5();
			var node_5 = $.child(div_1);

			{
				var consequent_3 = ($$anchor) => {
					var div_2 = root_2();
					var node_6 = $.child(div_2);

					$.snippet(node_6, () => $$props.left);
					$.reset(div_2);

					$.template_effect(($0) => $.set_class(div_2, 1, $0), [
						() => $.clsx($.get(leftCls)({ class: clsx($.get(theme)?.left, $.get(styling).left) }))
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_5, ($$render) => {
					if ($$props.left) $$render(consequent_3);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			inputContent(node_7, () => true);

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_3 = root_2();
					var node_9 = $.child(div_3);

					$.snippet(node_9, () => $$props.right);
					$.reset(div_3);

					$.template_effect(($0) => $.set_class(div_3, 1, $0), [
						() => $.clsx($.get(rightCls)({ class: clsx($.get(theme)?.right, $.get(styling).right) }))
					]);

					$.append($$anchor, div_3);
				};

				$.if(node_8, ($$render) => {
					if ($$props.right) $$render(consequent_4);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_4 = root_4();

					$.each(div_4, 22, () => $.get(filteredSuggestions), (item) => item, ($$anchor, item, i) => {
						var button = root_3();
						var p = $.child(button);
						var text = $.only_child(p, true);

						$.reset(button);

						$.template_effect(
							($0) => {
								$.set_class(button, 1, `w-full px-3 py-2 text-left ${$.get(i) === $.get(selectedIndex)
									? 'bg-gray-100 dark:bg-gray-700'
									: 'hover:bg-gray-50 dark:hover:bg-gray-700'} focus:outline-none`);

								$.set_class(p, 1, $0);
								$.set_text(text, item);
							},
							[
								() => $.clsx($.get(comboItem)({
									class: clsx($.get(theme)?.comboItem, $.get(styling).comboItem)
								}))
							]
						);

						$.delegated('click', button, () => selectItem(item));
						$.event('mouseenter', button, () => $.set(selectedIndex, $.get(i), true));
						$.append($$anchor, button);
					});

					$.reset(div_4);

					$.template_effect(($0) => $.set_class(div_4, 1, $0), [
						() => $.clsx($.get(combo)({ class: clsx($.get(theme)?.combo, $.get(styling).combo) }))
					]);

					$.append($$anchor, div_4);
				};

				$.if(node_10, ($$render) => {
					if ($.get(isCombobox) && $.get(isFocused) && $.get(filteredSuggestions).length > 0) $$render(consequent_5);
				});
			}

			$.reset(div_1);

			$.template_effect(($0) => $.set_class(div_1, 1, $0), [
				() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $.get(styling).div) }))
			]);

			$.append($$anchor, div_1);
		};

		var alternate_1 = ($$anchor) => {
			inputContent($$anchor, () => false);
		};

		$.if(node_4, ($$render) => {
			if ($.get(isCombobox) || $$props.right || $$props.left || clearable()) $$render(consequent_6); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_4);
	$.pop();
}

$.delegate(['click']);