import * as $ from 'svelte/internal/server';
import Indicator from "$lib/indicator/Indicator.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";
import { carouselIndicators } from "./theme";

export default function CarouselIndicators($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			activeClass,
			inactiveClass,
			position = "bottom",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("carouselIndicators"));
		const _state = getCarouselContext();

		const $$d = $.derived(() => carouselIndicators({ position })),
			base = $.derived(() => $$d().base),
			indicator = $.derived(() => $$d().indicator);

		function goToIndex(newIndex) {
			_state?.changeSlide(newIndex);
		}

		if (_state) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
				...restProps
			})}><!--[-->`);

			const each_array = $.ensure_array_like(_state.images);

			for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
				let _ = each_array[idx];
				const selected = _state.index === idx;

				$$renderer.push(`<button type="button"${$.attr('aria-current', selected ? "true" : undefined)}${$.attr('aria-label', `Go to slide ${idx + 1}`)}>`);

				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer, { selected, index: idx });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');

					Indicator($$renderer, {
						class: indicator()({
							selected,
							class: clsx(selected ? activeClass : inactiveClass, theme()?.indicator)
						})
					});
				}

				$$renderer.push(`<!--]--></button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}