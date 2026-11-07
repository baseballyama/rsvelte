import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Marquee($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			pauseOnHover = false,
			vertical = false,
			repeat = 4,
			reverse = false,
			class: _class = "",
			children
		} = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("group flex gap-(--gap) overflow-hidden p-2 [--duration:16s] [--gap:3rem]", { "flex-row": !vertical, "flex-col": vertical }, _class)), 'svelte-duxolg')}><!--[-->`);

		const each_array = $.ensure_array_like({ length: repeat });

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<div${$.attr_class(
				$.clsx(cn("flex shrink-0 justify-around gap-(--gap)", {
					"animate-marquee flex-row": !vertical,
					"animate-marquee-vertical flex-col": vertical,
					"group-hover:paused": pauseOnHover
				})),
				'svelte-duxolg'
			)}${$.attr_style(`animation-direction:${reverse ? 'reverse' : 'normal'}; `)}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}