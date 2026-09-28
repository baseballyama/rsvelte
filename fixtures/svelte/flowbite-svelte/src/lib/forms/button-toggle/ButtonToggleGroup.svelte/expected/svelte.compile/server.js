import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { buttonToggleGroup } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { setButtonToggleContext } from "$lib/context";

export default function ButtonToggleGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			multiSelect = false,
			name = "toggle-group",
			value,
			color,
			size = "md",
			roundedSize = "md",
			onSelect = () => {},
			children,
			ctxIconClass,
			ctxBtnClass,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("buttonToggleGroup"));
		const base = $.derived(() => buttonToggleGroup({ roundedSize, class: clsx(theme(), className) }));

		// Normalize incoming prop `value` to internal SelectedValue
		// Clones arrays to prevent external mutations affecting internal state
		function getInitialValue() {
			if (multiSelect) {
				// Multi-select mode expects array
				if (Array.isArray(value)) {
					return [...value]; // Clone to prevent aliasing
				} else if (value === null || value === undefined) {
					return [];
				} else {
					// Single string passed but multiSelect is true - wrap in array
					return [value];
				}
			} else {
				// Single-select mode expects string or null
				if (Array.isArray(value)) {
					// Array passed but multiSelect is false - take first item
					return value[0] ?? null;
				} else {
					return value ?? null; // Handle undefined case
				}
			}
		}

		let selectedValues = getInitialValue();

		function toggleSelected(toggleValue) {
			if (multiSelect) {
				const currentSelected = [...selectedValues];
				const index = currentSelected.indexOf(toggleValue);

				if (index === -1) {
					selectedValues = [...currentSelected, toggleValue];
				} else {
					currentSelected.splice(index, 1);
					selectedValues = currentSelected;
				}
			} else {
				selectedValues = toggleValue === selectedValues ? null : toggleValue;
			}

			onSelect(selectedValues); // ✅ ADD THIS LINE - call onSelect here
		}

		function isSelected(toggleValue) {
			if (multiSelect) {
				return selectedValues.includes(toggleValue);
			} else {
				return selectedValues === toggleValue;
			}
		}

		// Create context object with all button toggle related values
		const ctx = {
			get toggleSelected() {
				return toggleSelected;
			},

			get isSelected() {
				return isSelected;
			},

			get multiSelect() {
				return multiSelect;
			},

			get color() {
				return color;
			},

			get size() {
				return size;
			},

			get roundedSize() {
				return roundedSize;
			},

			get ctxIconClass() {
				return clsx(ctxIconClass);
			},

			get ctxBtnClass() {
				return clsx(ctxBtnClass);
			}
		};

		// Set context during initialization
		setButtonToggleContext(ctx);

		$$renderer.push(`<div class="inline"><div${$.attributes({
			class: $.clsx(base()),
			role: multiSelect ? "group" : "radiogroup",
			'aria-label': name,
			...restProps
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}