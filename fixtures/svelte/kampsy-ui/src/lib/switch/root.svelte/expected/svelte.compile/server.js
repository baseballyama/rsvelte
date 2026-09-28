import * as $ from 'svelte/internal/server';
import { randomString } from "$lib/utils/random.js";
import { setContext } from "svelte";
import { createRootState } from "./root.svelte.js";

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			name = undefined,
			size = "medium",
			fullWidth = false,
			children = undefined
		} = $$props;

		const switchProps = { name: "", size, fullWidth };

		if (name) {
			switchProps.name = name;
		} else {
			switchProps.name = randomString(8);
		}

		const rootState = createRootState({ selected: "", ...switchProps });

		setContext("switch", rootState);

		let width = $.derived(() => {
			if (fullWidth) {
				return "w-full";
			}

			return "";
		});

		// Large size has a different border radius than other sizes
		let borderRadius = $.derived(() => {
			if (size === "large") {
				return "rounded-[8px]";
			}

			return "rounded-md";
		});

		$$renderer.push(`<div${$.attr_class($.clsx(width()))}><div${$.attr_class(`flex items-center p-1 ${$.stringify(borderRadius())} border-kui-light-gray-200 dark:border-kui-dark-gray-400 border`)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { value });
	});
}