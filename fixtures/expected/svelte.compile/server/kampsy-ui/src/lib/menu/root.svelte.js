import * as $ from 'svelte/internal/server';
import { clickOutside } from "$lib/utils/event.js";
import { fade } from "svelte/transition";
import { createRootState } from "./root.svelte.js";
import { setContext } from "svelte";

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", alignment = "left", children = undefined } = $$props;

		const rootState = createRootState({
			isMobile: false,
			isActive: false,
			alignment,
			contentPosition: "top-[112%]",
			transY: -10
		});

		setContext("menu", rootState);

		if (// update when the user is resizing the window
		// when the esc key is pressed
		rootState.getIsActive()) {
			$$renderer.push(`<!--[0--><div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-40 lg:hidden"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class(`relative inline-block ${$.stringify(klass)}`)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}