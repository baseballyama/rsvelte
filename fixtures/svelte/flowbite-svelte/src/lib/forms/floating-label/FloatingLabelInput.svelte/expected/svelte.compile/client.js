import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { idGenerator } from "../../utils";
import { floatingLabelInput } from "./theme";
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
	'id',
	'value',
	'elementRef',
	'variant',
	'size',
	'color',
	'class',
	'classes',
	'inputClass',
	'labelClass',
	'clearable',
	'clearableSvgClass',
	'clearableColor',
	'clearableClass',
	'clearableOnClick',
	'data',
	'maxSuggestions',
	'onSelect',
	'comboClass',
	'placeholder'
]);

var root = $.from_html(`<div tabindex="-1" class="sr-only"></div>`);
var root_1 = $.from_html(`<button type="button"> </button>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<!> <div><input/> <!> <label><!></label> <!></div>`, 1);

export default function FloatingLabelInput($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, idGenerator),
		value = $.prop($$props, 'value', 15),
		elementRef = $.prop($$props, 'elementRef', 15),
		variant = $.prop($$props, 'variant', 3, "standard"),
		size = $.prop($$props, 'size', 3, "default"),
		color = $.prop($$props, 'color', 3, "default"),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		data = $.prop($$props, 'data', 19, () => []),
		maxSuggestions = $.prop($$props, 'maxSuggestions', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"FloatingLabelInput",
		untrack(() => ({
			inputClass: $$props.inputClass,
			labelClass: $$props.labelClass,
			clearableSvgClass: $$props.clearableSvgClass,
			clearableClass: $$props.clearableClass,
			comboClass: $$props.comboClass
		})),
		{
			inputClass: "input",
			labelClass: "label",
			clearableSvgClass: "svg",
			clearableClass: "close",
			comboClass: "combo"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		input: $$props.inputClass,
		label: $$props.labelClass,
		svg: $$props.clearableSvgClass,
		close: $$props.clearableClass,
		combo: $$props.comboClass
	});

	const theme = $.derived(() => getTheme("floatingLabelInput"));

	const $$d = $.derived(() => floatingLabelInput({ variant: variant(), size: size(), color: color() })),
		base = $.derived(() => $.get($$d).base),
		input = $.derived(() => $.get($$d).input),
		label = $.derived(() => $.get($$d).label),
		close = $.derived(() => $.get($$d).close),
		combo = $.derived(() => $.get($$d).combo);

	const clearAll = () => {
		if (elementRef()) {
			elementRef(elementRef().value = "", true);
			value("");
			$.set(backspaceUsed, false);
			updateSuggestions();
			dummyFocusDiv?.focus();

			setTimeout(
				() => {
					elementRef()?.focus();
				},
				100
			);
		}

		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	const isCombobox = $.derived(() => Array.isArray(data()) && data().length > 0);

	// svelte-ignore non_reactive_update
	let dummyFocusDiv;

	let isFocused = $.state(false);
	let filteredSuggestions = $.state($.proxy([]));
	let selectedIndex = $.state(-1);
	let backspaceUsed = $.state(false);

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

		if (searchTerm === "" && !$.get(backspaceUsed)) {
			$.set(filteredSuggestions, [], true);
		} else if (searchTerm) {
			$.set(filteredSuggestions, data().filter((item) => item.toLowerCase().includes(searchTerm)).slice(0, maxSuggestions()), true);
		} else if ($.get(backspaceUsed)) {
			$.set(filteredSuggestions, [...data()].slice(0, maxSuggestions()), true);
		}

		$.set(selectedIndex, -1);
	}

	$.user_effect(() => {
		if ($.get(isCombobox)) {
			updateSuggestions();
		}
	});

	function handleInput() {
		if (value().length > 0) {
			$.set(backspaceUsed, false);
		}

		updateSuggestions();
	}

	function handleFocus() {
		$.set(isFocused, true);
		updateSuggestions();
	}

	function handleBlur() {
		setTimeout(
			() => {
				$.set(isFocused, false);
				$.set(backspaceUsed, false);
				$.set(filteredSuggestions, [], true);
			},
			200
		);
	}

	function handleKeydown(event) {
		if (!$.get(isCombobox)) return;

		if (event.key === "Backspace" || event.key === "Delete") {
			const currentValue = value();

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

		if ($$props.onSelect) $$props.onSelect(item);

		$.set(filteredSuggestions, [], true);
		$.set(selectedIndex, -1);
		elementRef()?.focus();
	}

	createDismissableContext(clearAll);

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.bind_this(div, ($$value) => dummyFocusDiv = $$value, () => dummyFocusDiv);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.clearable) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var input_1 = $.child(div_1);

	$.attribute_effect(
		input_1,
		($0) => ({
			id: id(),
			placeholder: ' ',
			...restProps,
			class: $0,
			oninput: handleInput,
			onfocus: handleFocus,
			onblur: handleBlur,
			onkeydown: handleKeydown
		}),
		[
			() => $.get(input)({ class: clsx($.get(theme)?.input, $.get(styling).input) })
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input_1, ($$value) => elementRef($$value), () => elementRef());

	var node_1 = $.sibling(input_1, 2);

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

		$.if(node_1, ($$render) => {
			if (value() !== undefined && value() !== "" && $$props.clearable) $$render(consequent_1);
		});
	}

	var label_1 = $.sibling(node_1, 2);
	var node_2 = $.child(label_1);

	$.snippet(node_2, () => $$props.children);
	$.reset(label_1);

	var node_3 = $.sibling(label_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();

			$.each(div_2, 22, () => $.get(filteredSuggestions), (item) => item, ($$anchor, item, i) => {
				var button = root_1();
				var text = $.only_child(button, true);

				$.template_effect(() => {
					$.set_class(button, 1, `w-full px-3 py-2 text-left ${$.get(i) === $.get(selectedIndex)
						? 'bg-gray-100 dark:bg-gray-700'
						: 'hover:bg-gray-50 dark:hover:bg-gray-700'} focus:outline-none`);

					$.set_text(text, item);
				});

				$.delegated('click', button, () => selectItem(item));
				$.event('mouseenter', button, () => $.set(selectedIndex, $.get(i), true));
				$.append($$anchor, button);
			});

			$.reset(div_2);

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx($.get(combo)({ class: clsx($.get(theme)?.combo, $.get(styling).combo) }))
			]);

			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($.get(isCombobox) && $.get(isFocused) && $.get(filteredSuggestions).length > 0) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	$.template_effect(
		($0, $1) => {
			$.set_class(div_1, 1, $0);
			$.set_attribute(label_1, 'for', id());
			$.set_class(label_1, 1, $1);
		},
		[
			() => $.clsx($.get(base)({
				class: clsx($.get(isCombobox) ? "relative" : "", $.get(theme)?.base, $$props.class)
			})),
			() => $.clsx($.get(label)({ class: clsx($.get(theme)?.label, $.get(styling).label) }))
		]
	);

	$.bind_value(input_1, value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);