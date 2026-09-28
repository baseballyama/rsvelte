import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { buttonToggleGroup } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { setButtonToggleContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'multiSelect',
	'name',
	'value',
	'color',
	'size',
	'roundedSize',
	'onSelect',
	'children',
	'ctxIconClass',
	'ctxBtnClass',
	'class'
]);

var root = $.from_html(`<div class="inline"><div><!></div></div>`);

export default function ButtonToggleGroup($$anchor, $$props) {
	$.push($$props, true);

	let multiSelect = $.prop($$props, 'multiSelect', 3, false),
		name = $.prop($$props, 'name', 3, "toggle-group"),
		size = $.prop($$props, 'size', 3, "md"),
		roundedSize = $.prop($$props, 'roundedSize', 3, "md"),
		onSelect = $.prop($$props, 'onSelect', 3, () => {}),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("buttonToggleGroup"));

	const base = $.derived(() => buttonToggleGroup({
		roundedSize: roundedSize(),
		class: clsx($.get(theme), $$props.class)
	}));

	// Normalize incoming prop `value` to internal SelectedValue
	// Clones arrays to prevent external mutations affecting internal state
	function getInitialValue() {
		if (multiSelect()) {
			// Multi-select mode expects array
			if (Array.isArray($$props.value)) {
				return [...$$props.value]; // Clone to prevent aliasing
			} else if ($$props.value === null || $$props.value === undefined) {
				return [];
			} else {
				// Single string passed but multiSelect is true - wrap in array
				return [$$props.value];
			}
		} else {
			// Single-select mode expects string or null
			if (Array.isArray($$props.value)) {
				// Array passed but multiSelect is false - take first item
				return $$props.value[0] ?? null;
			} else {
				return $$props.value ?? null; // Handle undefined case
			}
		}
	}

	let selectedValues = $.state($.proxy(getInitialValue()));

	function toggleSelected(toggleValue) {
		if (multiSelect()) {
			const currentSelected = [...$.get(selectedValues)];
			const index = currentSelected.indexOf(toggleValue);

			if (index === -1) {
				$.set(selectedValues, [...currentSelected, toggleValue], true);
			} else {
				currentSelected.splice(index, 1);
				$.set(selectedValues, currentSelected, true);
			}
		} else {
			$.set(selectedValues, toggleValue === $.get(selectedValues) ? null : toggleValue, true);
		}

		onSelect()($.get(selectedValues // ✅ ADD THIS LINE - call onSelect here
		));
	}

	function isSelected(toggleValue) {
		if (multiSelect()) {
			return $.get(selectedValues).includes(toggleValue);
		} else {
			return $.get(selectedValues) === toggleValue;
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
			return multiSelect();
		},

		get color() {
			return $$props.color;
		},

		get size() {
			return size();
		},

		get roundedSize() {
			return roundedSize();
		},

		get ctxIconClass() {
			return clsx($$props.ctxIconClass);
		},

		get ctxBtnClass() {
			return clsx($$props.ctxBtnClass);
		}
	};

	// Set context during initialization
	setButtonToggleContext(ctx);

	var div = root();
	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({
		class: $.get(base),
		role: multiSelect() ? "group" : "radiogroup",
		'aria-label': name(),
		...restProps
	}));

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}