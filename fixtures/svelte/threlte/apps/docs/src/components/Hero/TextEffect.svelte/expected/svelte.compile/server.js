import * as $ from 'svelte/internal/server';
import anime from 'animejs';
import { clamp, mapLinear } from 'three/src/math/MathUtils.js';

export default function TextEffect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = 'fade',
			progress,
			id,
			in: _in,
			out: _out = undefined,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let timeline = void 0;
		let completeDuration = 0;

		const initializeTimeline = () => {
			timeline = anime.timeline({ autoplay: false });

			if (type === 'fade-up-skew-individual') {
				// get all letter elements
				timeline.add({
					targets: `#${id} .letter`,
					translateY: [30, 0],
					skewY: [10, 0],
					opacity: [0, 1],
					easing: 'easeOutCubic',
					duration: 1000,
					delay: (_el, i) => 50 * (i + 1)
				});
			} else if (type === 'fade-individual') {
				timeline.add({
					targets: `#${id} .letter`,
					opacity: [0, 1],
					easing: 'easeOutCubic',
					duration: 1000,
					delay: (_el, i) => 150 * (i + 1)
				});
			} else if (type === 'fade') {
				timeline.add({
					targets: `#${id} .letter`,
					opacity: [0, 1],
					easing: 'easeOutCubic',
					duration: 1000
				});
			} else if (type === 'fade-up') {
				timeline.add({
					targets: `#${id} .letter`,
					opacity: [0, 1],
					translateY: [5, 0],
					easing: 'easeOutCubic',
					duration: 1000
				});
			}

			completeDuration = timeline.duration;
			timeline = timeline;
		};

		const transform = (node) => {
			const originalInnerHTML = node.innerHTML;

			node.innerHTML = node.textContent?.replace(/\S/g, "<span class='letter' style='display: inline-block'>$&</span>") ?? '';
			initializeTimeline();

			return {
				destroy() {
					timeline?.pause();
					timeline = undefined;
					node.innerHTML = originalInnerHTML;
				}
			};
		};

		let opacity = $.derived(() => _out
			? clamp(mapLinear(progress, _out.start, _out.end, 1, 0), 0, 1)
			: 1);

		$$renderer.push(`<div${$.attributes({ id, ...rest, style: `opacity: ${$.stringify(opacity())}` })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}