import * as $ from 'svelte/internal/server';
import { animate } from "motion";

export default function CircularText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text, spinDuration = 20, onHover = "speedUp", className = "" } = $$props;
		const letters = $.derived(() => Array.from(text));
		let divEl = void 0;
		let currentRotation = 0;
		let controls;

		function getRotationTransition(duration, from, loop = true) {
			return {
				from,
				to: from + 360,
				ease: "linear",
				duration,
				repeat: loop ? Infinity : 0
			};
		}

		function startAnimation(duration, scale = 1) {
			if (!divEl) return;

			controls?.stop();

			controls = animate(divEl, { rotate: [currentRotation, currentRotation + 360], scale }, {
				rotate: getRotationTransition(duration, currentRotation),
				scale: { type: "spring", damping: 20, stiffness: 300 }
			});

			controls.finished.then(() => {
				currentRotation = (currentRotation + 360) % 360;
			}).catch(() => {});
		}

		function handleMouseEnter() {
			if (!onHover) return;

			switch (onHover) {
				case "slowDown":
					startAnimation(spinDuration * 2);
					break;

				case "speedUp":
					startAnimation(spinDuration / 4);
					break;

				case "pause":
					controls?.stop();
					break;

				case "goBonkers":
					startAnimation(spinDuration / 20, 0.8);
					break;
			}
		}

		function handleMouseLeave() {
			startAnimation(spinDuration);
		}

		$$renderer.push(`<div role="img"${$.attr_class(`m-0 mx-auto rounded-full w-50 h-50 relative font-black text-white text-center cursor-pointer origin-center ${$.stringify(className)}`)}><!--[-->`);

		const each_array = $.ensure_array_like(letters());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let letter = each_array[i];
			const rotationDeg = 360 / letters().length * i;
			const factor = Math.PI / letters().length;
			const x = factor * i;
			const y = factor * i;
			const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

			$$renderer.push(`<span class="inline-block absolute inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"${$.attr_style('', { transform, '-webkit-transform': transform })}>${$.escape(letter)}</span>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}