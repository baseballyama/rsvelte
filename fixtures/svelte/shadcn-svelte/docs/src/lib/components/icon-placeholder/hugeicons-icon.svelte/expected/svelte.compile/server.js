import * as $ from 'svelte/internal/server';
import { HugeiconsIcon } from "@hugeicons/svelte";
import { hugeiconsIconLoader } from "./icon-loader.js";

export default function Hugeicons_icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon,
			placeholder,
			className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// svelte-ignore state_referenced_locally
		const IconPromise = hugeiconsIconLoader(icon);

		$.await(
			$$renderer,
			IconPromise,
			() => {
				placeholder?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			(Icon) => {
				if (Icon !== null) {
					$$renderer.push('<!--[0-->');

					HugeiconsIcon($$renderer, $.spread_props([
						{
							icon: Icon,
							strokeWidth: 2,
							'data-slot': 'hugeicons-icon',
							className
						},
						restProps
					]));
				} else {
					$$renderer.push('<!--[-1-->');
					placeholder?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}