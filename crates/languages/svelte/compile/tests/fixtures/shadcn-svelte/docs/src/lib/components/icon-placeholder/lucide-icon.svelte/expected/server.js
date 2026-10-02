import * as $ from 'svelte/internal/server';
import { lucideIconLoader } from "./icon-loader.js";

export default function Lucide_icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon,
			placeholder,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// svelte-ignore state_referenced_locally
		const IconPromise = lucideIconLoader(icon);

		const rp = $.derived(() => restProps);

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

					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, $.spread_props([{ class: className }, rp()]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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