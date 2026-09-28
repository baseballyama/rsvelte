import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Button from "$lib/buttons/Button.svelte";
import GradientButton from "$lib/buttons/GradientButton.svelte";

function moving_cross($$renderer) {
	$$renderer.push(`<svg aria-hidden="true" class="h-8 w-8 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`);
}

export default function SpeedDialTrigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			name = "Open actions menu",
			gradient = false,
			icon,
			pill = true,
			color,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const buttonProps = $.derived(() => ({
			pill,
			color,
			...restProps,
			class: ["group p-3!", clsx(className)]
		}));

		if (gradient) {
			$$renderer.push('<!--[0-->');

			GradientButton($$renderer, $.spread_props([
				buttonProps(),
				{
					children: ($$renderer) => {
						if (icon) {
							$$renderer.push('<!--[0-->');
							icon($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
							moving_cross($$renderer);
						}

						$$renderer.push(`<!--]--> <span class="sr-only">${$.escape(name)}</span>`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, $.spread_props([
				buttonProps(),
				{
					children: ($$renderer) => {
						if (icon) {
							$$renderer.push('<!--[0-->');
							icon($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
							moving_cross($$renderer);
						}

						$$renderer.push(`<!--]--> <span class="sr-only">${$.escape(name)}</span>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!--]-->`);
	});
}