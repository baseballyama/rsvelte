import * as $ from 'svelte/internal/server';
import Button from "$lib/button/button.svelte";
import { getContext } from "svelte";

export default function Button_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;
		const rootState = getContext("menu");
		let buttonElement = void 0;

		const toogle = (evt) => {
			const target = evt.currentTarget;
			const position = target.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const positionFromTop = position.top;
			const positionFromBottom = viewportHeight - position.bottom;

			if (positionFromTop > positionFromBottom) {
				rootState.setContentPosition(`bottom-[112%]`);
				rootState.setTransY(10);
			} else {
				rootState.setContentPosition(`top-[112%]`);
				rootState.setTransY(-10);
			}

			rootState.setIsActive(!rootState.getIsActive());
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (children) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, $.spread_props([
					rest,
					{
						onclick: toogle,
						get buttonElement() {
							return buttonElement;
						},

						set buttonElement($$value) {
							buttonElement = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}