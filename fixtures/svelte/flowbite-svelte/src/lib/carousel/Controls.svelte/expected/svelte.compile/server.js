import * as $ from 'svelte/internal/server';
import ControlButton from "./ControlButton.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";

export default function Controls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("controlButton"));
		const _state = getCarouselContext();

		function changeSlide(forward) {
			if (!_state) return;

			_state.changeSlide(forward ? _state.index + 1 : _state.index - 1);
		}

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, changeSlide);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			ControlButton($$renderer, $.spread_props([
				{
					name: 'Previous',
					forward: false,
					onclick: () => changeSlide(false),
					class: clsx(theme(), className)
				},
				restProps
			]));

			$$renderer.push(`<!----> `);

			ControlButton($$renderer, $.spread_props([
				{
					name: 'Next',
					forward: true,
					onclick: () => changeSlide(true),
					class: clsx(theme(), className)
				},
				restProps
			]));

			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}