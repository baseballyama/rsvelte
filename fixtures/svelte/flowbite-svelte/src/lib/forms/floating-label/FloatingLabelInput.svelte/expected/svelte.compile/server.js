import * as $ from 'svelte/internal/server';
import { idGenerator } from "../../utils";
import { floatingLabelInput } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function FloatingLabelInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			id = idGenerator(),
			value = void 0,
			elementRef = void 0,
			variant = "standard",
			size = "default",
			color = "default",
			class: className,
			classes,
			inputClass,
			labelClass,
			clearable,
			clearableSvgClass,
			clearableColor = "none",
			clearableClass,
			clearableOnClick,
			data = [],
			maxSuggestions = 5,
			onSelect,
			comboClass,
			placeholder,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"FloatingLabelInput",
			untrack(() => ({
				inputClass,
				labelClass,
				clearableSvgClass,
				clearableClass,
				comboClass
			})),
			{
				inputClass: "input",
				labelClass: "label",
				clearableSvgClass: "svg",
				clearableClass: "close",
				comboClass: "combo"
			}
		);

		const styling = $.derived(() => classes ?? {
			input: inputClass,
			label: labelClass,
			svg: clearableSvgClass,
			close: clearableClass,
			combo: comboClass
		});

		const theme = $.derived(() => getTheme("floatingLabelInput"));

		const $$d = $.derived(() => floatingLabelInput({ variant, size, color })),
			base = $.derived(() => $$d().base),
			input = $.derived(() => $$d().input),
			label = $.derived(() => $$d().label),
			close = $.derived(() => $$d().close),
			combo = $.derived(() => $$d().combo);

		const clearAll = () => {
			if (elementRef) {
				elementRef.value = "";
				value = "";
				backspaceUsed = false;
				updateSuggestions();
				dummyFocusDiv?.focus();

				setTimeout(
					() => {
						elementRef?.focus();
					},
					100
				);
			}

			if (clearableOnClick) clearableOnClick();
		};

		const isCombobox = $.derived(() => Array.isArray(data) && data.length > 0);

		// svelte-ignore non_reactive_update
		let dummyFocusDiv;

		let isFocused = false;
		let filteredSuggestions = [];
		let selectedIndex = -1;
		let backspaceUsed = false;

		function updateSuggestions() {
			if (!isCombobox() || !isFocused) {
				filteredSuggestions = [];

				return;
			}

			const fullSearchTerm = (value || "").toLowerCase();
			const lastSpaceIndex = fullSearchTerm.lastIndexOf(" ");

			const searchTerm = lastSpaceIndex === -1
				? fullSearchTerm
				: fullSearchTerm.substring(lastSpaceIndex + 1);

			if (searchTerm === "" && !backspaceUsed) {
				filteredSuggestions = [];
			} else if (searchTerm) {
				filteredSuggestions = data.filter((item) => item.toLowerCase().includes(searchTerm)).slice(0, maxSuggestions);
			} else if (backspaceUsed) {
				filteredSuggestions = [...data].slice(0, maxSuggestions);
			}

			selectedIndex = -1;
		}

		function handleInput() {
			if (value.length > 0) {
				backspaceUsed = false;
			}

			updateSuggestions();
		}

		function handleFocus() {
			isFocused = true;
			updateSuggestions();
		}

		function handleBlur() {
			setTimeout(
				() => {
					isFocused = false;
					backspaceUsed = false;
					filteredSuggestions = [];
				},
				200
			);
		}

		function handleKeydown(event) {
			if (!isCombobox()) return;

			if (event.key === "Backspace" || event.key === "Delete") {
				const currentValue = value;

				if (currentValue.length <= 1) {
					backspaceUsed = true;
				}
			}

			if (!filteredSuggestions.length) return;

			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					selectedIndex = (selectedIndex + 1) % filteredSuggestions.length;
					break;

				case "ArrowUp":
					event.preventDefault();
					selectedIndex = selectedIndex <= 0 ? filteredSuggestions.length - 1 : selectedIndex - 1;
					break;

				case "Enter":
					if (selectedIndex >= 0) {
						event.preventDefault();
						selectItem(filteredSuggestions[selectedIndex]);
					}
					break;

				case "Escape":
					event.preventDefault();
					filteredSuggestions = [];
					break;
			}
		}

		function selectItem(item) {
			const currentValue = value || "";
			const lastSpaceIndex = currentValue.lastIndexOf(" ");

			if (lastSpaceIndex === -1) {
				value = item + " "; // Replace the whole value if no space, add trailing space
			} else {
				value = currentValue.substring(0, lastSpaceIndex + 1) + item + " "; // Replace last word, add trailing space
			}

			if (onSelect) onSelect(item);

			filteredSuggestions = [];
			selectedIndex = -1;
			elementRef?.focus();
		}

		createDismissableContext(clearAll);

		if (clearable) {
			$$renderer.push(`<!--[0--><div tabindex="-1" class="sr-only"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(base()({
			class: clsx(isCombobox() ? "relative" : "", theme()?.base, className)
		})))}><input${$.attributes(
			{
				id,
				placeholder: ' ',
				value,
				...restProps,
				class: $.clsx(input()({ class: clsx(theme()?.input, styling().input) }))
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> `);

		if (value !== undefined && value !== "" && clearable) {
			$$renderer.push('<!--[0-->');

			CloseButton($$renderer, {
				class: close()({ class: clsx(theme()?.close, styling().close) }),
				color: clearableColor,
				'aria-label': 'Clear search value',
				svgClass: clsx(styling().svg)
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <label${$.attr('for', id)}${$.attr_class($.clsx(label()({ class: clsx(theme()?.label, styling().label) })))}>`);
		children($$renderer);
		$$renderer.push(`<!----></label> `);

		if (isCombobox() && isFocused && filteredSuggestions.length > 0) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(combo()({ class: clsx(theme()?.combo, styling().combo) })))}><!--[-->`);

			const each_array = $.ensure_array_like(filteredSuggestions);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				$$renderer.push(`<button type="button"${$.attr_class(`w-full px-3 py-2 text-left ${i === selectedIndex
					? 'bg-gray-100 dark:bg-gray-700'
					: 'hover:bg-gray-50 dark:hover:bg-gray-700'} focus:outline-none`)}>${$.escape(item)}</button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, elementRef });
	});
}