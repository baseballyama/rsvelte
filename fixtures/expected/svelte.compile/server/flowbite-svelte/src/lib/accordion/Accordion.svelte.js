import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setAccordionContext } from "$lib/context";
import { accordion } from "./theme";
import { createSingleSelectionContext } from "$lib/utils/singleselection.svelte";
import { untrack } from "svelte";

export default function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			flush,
			activeClass,
			inactiveClass,
			multiple = false,
			class: className,
			transitionType,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("accordion"));

		// Simple reactive state object
		const reactiveCtx = {
			get flush() {
				return flush;
			},

			get activeClass() {
				return activeClass;
			},

			get inactiveClass() {
				return inactiveClass;
			},

			get transitionType() {
				return transitionType;
			}
		};

		// Set context during initialization
		setAccordionContext(reactiveCtx);

		// Create selection context synchronously for proper nesting
		// Use untrack to explicitly capture only the initial value
		createSingleSelectionContext(untrack(() => multiple));

		const base = $.derived(() => accordion({ flush, class: clsx(theme(), className) }));

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}