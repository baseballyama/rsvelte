import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setAccordionContext } from "$lib/context";
import { accordion } from "./theme";
import { createSingleSelectionContext } from "$lib/utils/singleselection.svelte";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'flush',
	'activeClass',
	'inactiveClass',
	'multiple',
	'class',
	'transitionType'
]);

var root = $.from_html(`<div><!></div>`);

export default function Accordion($$anchor, $$props) {
	$.push($$props, true);

	let multiple = $.prop($$props, 'multiple', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("accordion"));

	// Simple reactive state object
	const reactiveCtx = {
		get flush() {
			return $$props.flush;
		},

		get activeClass() {
			return $$props.activeClass;
		},

		get inactiveClass() {
			return $$props.inactiveClass;
		},

		get transitionType() {
			return $$props.transitionType;
		}
	};

	// Set context during initialization
	setAccordionContext(reactiveCtx);

	// Create selection context synchronously for proper nesting
	// Use untrack to explicitly capture only the initial value
	createSingleSelectionContext(untrack(() => multiple()));

	const base = $.derived(() => accordion({
		flush: $$props.flush,
		class: clsx($.get(theme), $$props.class)
	}));

	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}