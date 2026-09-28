import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";
import { fly } from "svelte/transition";
import { slide } from "./theme";

export default function Slide($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _state = getCarouselContext();

		let {
			image,
			transition,
			fit,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("slide"));

		let transitionSlideIn = $.derived(() => ({
			x: _state?.forward ? "100%" : "-100%",
			opacity: 1,
			width: "100%",
			height: "100%",
			duration: _state?.slideDuration ?? 1000
		}));

		let transitionSlideOut = $.derived(() => ({
			x: _state?.forward ? "-100%" : "100%",
			opacity: 0.9,
			width: "100%",
			height: "100%",
			duration: _state?.slideDuration ?? 1000
		}));

		let imgClass = $.derived(() => slide({ fit, class: clsx(theme(), className) }));

		if (transition) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				$$renderer.push(`<img${$.attributes({
					alt: '...',
					...image,
					...restProps,
					class: $.clsx(imgClass())
				})} onload="this.__e=event" onerror="this.__e=event"/>`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><!---->`);

			{
				$$renderer.push(`<img${$.attributes({
					alt: '...',
					...image,
					...restProps,
					class: $.clsx(imgClass())
				})} onload="this.__e=event" onerror="this.__e=event"/>`);
			}

			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}