import * as $ from 'svelte/internal/server';
import { clickOutside } from "$lib/utils/event.js";
import { setContext } from "svelte";
import { fade } from "svelte/transition";
import { createRootState } from "./root.svelte.js";

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			error = "",
			loading = false,
			size = "medium",
			class: klass = "",
			children
		} = $$props;

		const rootState = createRootState({
			isMobile: false,
			error,
			loading,
			selected: "",
			isActive: false,
			size,
			contentPosition: "top-[112%]",
			transY: -10
		});

		setContext("select", rootState);

		if (// Assign the selected value to the parent component value prop when changed.
		// update when the user is resizing the window
		// when the esc key is pressed
		// When error is changed
		// When loading is changed
		rootState.getIsActive()) {
			$$renderer.push(`<!--[0--><div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-[0.4] lg:hidden"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div><div${$.attr_class(`relative inline-block ${$.stringify(klass)}`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { value, error, loading });
	});
}