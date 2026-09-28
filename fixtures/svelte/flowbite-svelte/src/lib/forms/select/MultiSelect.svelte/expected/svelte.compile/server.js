import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Badge from "$lib/badge/Badge.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { multiSelect } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { onMount, untrack } from "svelte";
import { createDismissableContext } from "$lib/utils/dismissable";
import { getButtonGroupContext } from "$lib/context";

export default function MultiSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Consider reusing that component - https://svelecte.vercel.app/
		let {
			children,
			items = [],
			value = void 0,
			size = "md",
			dropdownClass = "",
			placeholder = "",
			disabled = false,
			onchange,
			onblur,
			class: className,
			classes,
			// Extract select-specific props
			id,
			name,
			form,
			required,
			autocomplete,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("MultiSelect", untrack(() => ({ dropdownClass })), { dropdownClass: "dropdown" });

		const styling = $.derived(() => classes ?? { dropdown: dropdownClass });
		const theme = $.derived(() => getTheme("multiSelect"));
		let selectItems = $.derived(() => items.filter((x) => value.includes(x.value)));
		let show = false;
		const group = getButtonGroupContext();

		// Active item
		let activeIndex = null;

		let activeItem = $.derived(() => activeIndex !== null
			? items[(activeIndex % items.length + items.length) % items.length]
			: null);

		let multiSelectContainer; // Reference to the main div

		const selectOption = (select, event) => {
			// Prevent the click from propagating to the parent div
			event.stopPropagation();

			if (disabled) return;
			if (select.disabled) return;

			const oldValue = [...value];

			if (value.includes(select.value)) {
				clearThisOption(select);
			} else if (!value.includes(select.value)) {
				value = [...value, select.value];
			}

			// Trigger onchange if value actually changed
			if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
				triggerChange();
			}
		};

		const clearAll = (e) => {
			if (disabled) return;

			e.stopPropagation();

			const oldValue = [...value];

			value = [];

			if (oldValue.length > 0) {
				triggerChange();
			}
		};

		createDismissableContext(clearAll);

		const clearThisOption = (select) => {
			if (disabled) return;

			if (value.includes(select.value)) {
				const oldValue = [...value];

				value = value.filter((o) => o !== select.value);

				if (oldValue.length !== value.length) {
					triggerChange();
				}
			}
		};

		// Helper function to trigger change events
		const triggerChange = () => {
			if (onchange) {
				// Create a proper change event for the hidden select element
				const changeEvent = new Event("change", { bubbles: true });

				Object.defineProperty(changeEvent, "target", { value: { value }, enumerable: true });
				Object.defineProperty(changeEvent, "currentTarget", { value: { value }, enumerable: true });
				onchange(changeEvent);
			}
		};

		const closeDropdown = () => !disabled && (show = false);

		const toggleDropdown = (event) => {
			if (disabled) return;

			// Prevent immediate closing if the click originated from within the component itself
			// This is useful if the click triggers a re-render and focus is lost momentarily.
			if (multiSelectContainer && multiSelectContainer.contains(event.target)) {
				show = !show;
				event.preventDefault();
			} else {
				show = false; // Close if clicked outside
			}
		};

		// Handle blur event for validation
		const handleBlur = (event) => {
			// We'll rely more on the global click listener for closing, but keep this for standard blur behavior
			if (event.currentTarget && event.currentTarget.contains && !event.currentTarget.contains(event.relatedTarget)) {
				closeDropdown();
			}

			if (onblur) {
				onblur(event);
			}
		};

		// Keyboard navigation
		function handleToggleActiveItem() {
			if (disabled) return;

			if (!show) {
				show = true;
				activeIndex = 0;
			} else {
				if (activeItem() !== null) selectOption(activeItem(), new MouseEvent("click")); // Pass a dummy MouseEvent
			}
		}

		function handleArrowUpDown(offset) {
			if (disabled) return;

			if (!show) {
				show = true;
				activeIndex = 0;
			} else {
				if (activeIndex !== null) {
					activeIndex += offset;
				} else {
					activeIndex = 0;
				}
			}
		}

		function handleKeyDown(event) {
			if (disabled) return;

			// Do not prevent default for tab key, allow it to move focus
			if (event.key !== "Tab") {
				event.preventDefault();
			}

			event.stopPropagation();

			const actions = {
				Escape: closeDropdown,
				Enter: handleToggleActiveItem,
				" ": handleToggleActiveItem,
				ArrowDown: () => handleArrowUpDown(1),
				ArrowUp: () => handleArrowUpDown(-1)
			};

			if (event.key in actions) {
				actions[event.key]?.();
			}
		}

		// Global click listener for closing the dropdown when clicking outside
		onMount(() => {
			const handleClickOutside = (event) => {
				if (multiSelectContainer && !multiSelectContainer.contains(event.target)) {
					closeDropdown();
				}
			};

			document.addEventListener("click", handleClickOutside);

			return () => {
				document.removeEventListener("click", handleClickOutside);
			};
		});

		const $$d = $.derived(() => multiSelect({ disabled, grouped: !!group })),
			base = $.derived(() => $$d().base),
			dropdown = $.derived(() => $$d().dropdown),
			dropdownItem = $.derived(() => $$d().item),
			close = $.derived(() => $$d().close),
			select = $.derived(() => $$d().select),
			placeholderSpan = $.derived(() => $$d().placeholder),
			svg = $.derived(() => $$d().svg);

		$$renderer.push(`<div${$.attributes({
			...restProps,
			tabindex: '0',
			role: 'listbox',
			class: $.clsx(base()({ size, class: clsx(theme()?.base, className) }))
		})}>`);

		$$renderer.select(
			{
				id,
				name,
				form,
				required,
				autocomplete,
				value,
				hidden: true,
				multiple: true,
				onchange
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.option({ value: item.value, disabled: item.disabled }, ($$renderer) => {
						$$renderer.push(`${$.escape(item.name)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(` `);

		if (!selectItems().length) {
			$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(placeholderSpan()({ class: clsx(classes?.placeholder) })))}>${$.escape(placeholder)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(select()({ class: clsx(theme()?.select, classes?.span) })))}>`);

		if (selectItems().length) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_1 = $.ensure_array_like(selectItems());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];

				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer, { item, clear: () => clearThisOption(item) });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');

					Badge($$renderer, {
						color: 'gray',
						large: size === "lg",
						dismissable: true,
						params: { duration: 100 },
						onclose: () => clearThisOption(item),
						class: ["mx-0.5 px-2 py-0", disabled && "pointer-events-none"],
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(item.name)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span> <div class="ms-auto flex items-center gap-2">`);

		if (selectItems().length) {
			$$renderer.push('<!--[0-->');

			CloseButton($$renderer, {
				size,
				color: 'none',
				class: close()({ class: clsx(theme()?.close, classes?.close) }),
				disabled
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <svg${$.attr_class($.clsx(clsx(svg()(), disabled && "cursor-not-allowed", classes?.svg)))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${$.attr('d', show ? "m1 5 4-4 4 4" : "m9 1-4 4-4-4")}></path></svg></div> `);

		if (show) {
			$$renderer.push(`<!--[0--><div role="presentation"${$.attr_class($.clsx(dropdown()({ class: clsx(styling().dropdown) })))}><!--[-->`);

			const each_array_2 = $.ensure_array_like(items);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_2[$$index_2];
				const isSelected = selectItems().includes(item);
				const isActive = activeItem() === item;

				$$renderer.push(`<div role="presentation"${$.attr_class($.clsx(dropdownItem()({
					selected: isSelected,
					active: isActive,
					disabled: item.disabled,
					class: clsx(classes?.item)
				})))}${$.attr('data-selected', isSelected ? "true" : undefined)}${$.attr('data-active', isActive ? "true" : undefined)}>${$.escape(item.name)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}