import * as $ from 'svelte/internal/server';
import AnimotionSlide from './slide.svelte';

export default function Slides($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { center = false } = $$props;

		const slides = Object.entries(import.meta.glob('/src/slides/**/slide.svelte', { eager: true })).map(([filename, exports]) => {
			const matches = filename.match(/slides\/(?<number>\d+)\/slide.svelte/);

			return [+matches.groups.number, exports];
		}).sort(([a], [b]) => a - b);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(slides);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [_, Slide] = each_array[$$index];
			const Wrapper = Slide.component ?? AnimotionSlide;

			const props = {
				class: center
					? 'h-full place-content-center place-items-center'
					: null,
				...Slide.props ?? {}
			};

			if (Wrapper) {
				$$renderer.push('<!--[-->');

				Wrapper($$renderer, $.spread_props([
					props,
					{
						children: ($$renderer) => {
							if (Slide.default) {
								$$renderer.push('<!--[-->');
								Slide.default($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}