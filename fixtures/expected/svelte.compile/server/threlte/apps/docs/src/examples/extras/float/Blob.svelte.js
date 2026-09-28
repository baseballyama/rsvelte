import * as $ from 'svelte/internal/server';
import { Float } from '@threlte/extras';
import { Spring } from 'svelte/motion';

export default function Blob($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const scale = new Spring(1);
		let hovering = false;

		const onPointerEnter = () => {
			hovering = true;
			scale.set(1.1);
		};

		const onPointerLeave = () => {
			hovering = false;
			scale.set(1);
		};

		Float($$renderer, {
			floatIntensity: 5,
			scale: scale.current,
			rotationIntensity: 2,
			rotationSpeed: [1, 0.5, 0.2],
			onpointerenter: onPointerEnter,
			onpointerleave: onPointerLeave,
			children: ($$renderer) => {
				children?.($$renderer, { hovering });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}