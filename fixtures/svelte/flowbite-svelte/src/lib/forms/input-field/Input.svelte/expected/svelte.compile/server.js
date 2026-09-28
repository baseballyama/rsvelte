import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import clsx from "clsx";
import { getButtonGroupContext } from "$lib/context";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { input } from "./theme";
import { clampSize } from "./index";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			left,
			right,
			value = void 0,
			elementRef = void 0,
			clearable = false,
			size,
			color = "default",
			class: className,
			classes,
			wrapperClass,
			leftClass,
			rightClass,
			divClass,
			clearableSvgClass,
			clearableColor = "none",
			clearableClass,
			clearableOnClick,
			data = [],
			maxSuggestions = 5,
			onSelect,
			comboClass,
			comboItemClass,
			onInput,
			onFocus,
			onBlur,
			onKeydown,
			oninput,
			onfocus,
			onblur,
			onkeydown,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"Input",
			untrack(() => ({
				wrapperClass,
				leftClass,
				rightClass,
				divClass,
				clearableSvgClass,
				clearableClass,
				comboClass
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

		const styling = $.derived(() => classes ?? {
			left: leftClass,
			right: rightClass,
			div: divClass,
			svg: clearableSvgClass,
			close: clearableClass,
			combo: comboClass,
			comboItem: comboItemClass
		});

		const theme = $.derived(() => getTheme("input"));

		// onSelect is a custom combobox selection handler that takes a string
		// standard DOM events, onInput, onFocus, onBlur, onKeydown will be deprecated in the next minor version
		const resolvedOnInput = $.derived(() => oninput || onInput);

		const resolvedOnFocus = $.derived(() => onfocus || onFocus);
		const resolvedOnBlur = $.derived(() => onblur || onBlur);
		const resolvedOnKeydown = $.derived(() => onkeydown || onKeydown);

		// Automatically enable combobox when data is provided
		const isCombobox = $.derived(() => Array.isArray(data) && data.length > 0);

		// tinted if put in component having its own background
		let background = getContext("background");

		// svelte-ignore non_reactive_update
		let dummyFocusDiv;

		let group = $.derived(getButtonGroupContext);
		let isGroup = $.derived(() => !!group());
		let _size = $.derived(() => size || (group()?.size ? clampSize(group().size) : undefined) || "md");
		const _color = $.derived(() => color === "default" && background ? "tinted" : color);

		const $$d = $.derived(() => input({ size: _size(), color: _color(), grouped: isGroup() })),
			base = $.derived(() => $$d().base),
			inputCls = $.derived(() => $$d().input),
			leftCls = $.derived(() => $$d().left),
			rightCls = $.derived(() => $$d().right),
			close = $.derived(() => $$d().close),
			combo = $.derived(() => $$d().combo),
			comboItem = $.derived(() => $$d().comboItem);

		const clearAll = () => {
			if (elementRef) {
				// in order to avoid type error in setTimeout()
				const input = elementRef;

				input.value = "";
				value = "";
				backspaceUsed = false;
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

			if (clearableOnClick) clearableOnClick();
		};

		createDismissableContext(clearAll);

		// Combobox functionality
		let isFocused = false;

		let filteredSuggestions = [];
		let selectedIndex = -1;
		let backspaceUsed = false; // Track if backspace was used to clear

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

			// Show suggestions if:
			// 1. There's actual input text, OR
			// 2. The input is empty but backspace was just used to clear it
			if (searchTerm === "" && !backspaceUsed) {
				filteredSuggestions = [];
			} else {
				// If there's text, filter suggestions
				if (searchTerm) {
					filteredSuggestions = data.filter((item) => item.toLowerCase().includes(searchTerm)).slice(0, maxSuggestions);
				} else // If empty but backspace was used, show all suggestions
				if (backspaceUsed) {
					filteredSuggestions = [...data].slice(0, maxSuggestions);
				}
			}

			selectedIndex = -1;
		}

		// Watch for value changes
		function defaultHandleInput(_event) {
			// Ensure value is treated as a string to safely check its length
			const currentValueAsString = String(value || "");

			if (currentValueAsString.length > 0) {
				backspaceUsed = false;
			}

			updateSuggestions();
		}

		function defaultHandleFocus() {
			isFocused = true;
			updateSuggestions();
		}

		function defaultHandleBlur() {
			// Small delay to allow click on suggestion to fire first
			setTimeout(
				() => {
					isFocused = false;
					backspaceUsed = false; // Reset flag when focus is lost
					filteredSuggestions = [];
				},
				200
			);
		}

		function defaultHandleKeydown(event) {
			if (!isCombobox()) return;

			// Special handling for backspace/delete - track when it's used to clear the input
			if (event.key === "Backspace" || event.key === "Delete") {
				const currentValue = value;

				// If this keypress will make the input empty
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

		// Combined event handlers that call custom handlers first, then default behavior
		function handleInput(event) {
			if (resolvedOnInput()) {
				resolvedOnInput()(event);
			}

			defaultHandleInput(event);
		}

		function handleFocus(event) {
			if (resolvedOnFocus()) {
				resolvedOnFocus()(event);
			}

			defaultHandleFocus();
		}

		function handleBlur(event) {
			if (resolvedOnBlur()) {
				resolvedOnBlur()(event);
			}

			defaultHandleBlur();
		}

		function handleKeydown(event) {
			if (resolvedOnKeydown()) {
				resolvedOnKeydown()(event);
			}

			defaultHandleKeydown(event);
		}

		function selectItem(item) {
			const currentValue = value || "";
			const lastSpaceIndex = currentValue.lastIndexOf(" ");

			if (lastSpaceIndex === -1) {
				value = item + " "; // Replace the whole value if no space, add trailing space
			} else {
				value = currentValue.substring(0, lastSpaceIndex + 1) + item + " "; // Replace last word, add trailing space
			}

			if (onSelect) {
				onSelect(item);
			}

			filteredSuggestions = [];
			selectedIndex = -1;

			if (elementRef) {
				elementRef.focus();
			}
		}

		function inputContent($$renderer, wrapped) {
			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { ...restProps, class: inputCls()() });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><input${$.attributes(
					{
						...restProps,
						value,
						class: $.clsx([
							wrapped || base()(),
							inputCls()({ class: clsx(theme()?.input, className) })
						])
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

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (clearable) {
			$$renderer.push(`<!--[0--><div tabindex="-1" class="sr-only"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isCombobox() || right || left || clearable) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, styling().div) })))}>`);

			if (left) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(leftCls()({ class: clsx(theme()?.left, styling().left) })))}>`);
				left($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			inputContent($$renderer, true);
			$$renderer.push(`<!----> `);

			if (right) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(rightCls()({ class: clsx(theme()?.right, styling().right) })))}>`);
				right($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (isCombobox() && isFocused && filteredSuggestions.length > 0) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(combo()({ class: clsx(theme()?.combo, styling().combo) })))}><!--[-->`);

				const each_array = $.ensure_array_like(filteredSuggestions);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let item = each_array[i];

					$$renderer.push(`<button type="button"${$.attr_class(`w-full px-3 py-2 text-left ${i === selectedIndex
						? 'bg-gray-100 dark:bg-gray-700'
						: 'hover:bg-gray-50 dark:hover:bg-gray-700'} focus:outline-none`)}><p${$.attr_class($.clsx(comboItem()({ class: clsx(theme()?.comboItem, styling().comboItem) })))}>${$.escape(item)}</p></button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			inputContent($$renderer, false);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { value, elementRef });
	});
}