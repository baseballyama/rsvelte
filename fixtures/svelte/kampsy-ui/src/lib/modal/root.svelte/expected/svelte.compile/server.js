import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import { createModalState } from "./root.svelte.js";
import { preventScroll } from "$lib/utils/general.js";
import { fade } from "svelte/transition";

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { active = false, sticky = false, children } = $$props;
		let dialog;
		const rootState = createModalState({ isMobile: false, isActive: active, sticky });

		setContext("modal", rootState);

		if (// update when the user is resizing the window
		active) {
			$$renderer.push(`<!--[0--><div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-40"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <dialog><div class="fixed top-0 left-0 flex h-full w-full items-center justify-center">`);
		children($$renderer);
		$$renderer.push(`<!----></div></dialog>`);
		$.bind_props($$props, { active });
	});
}