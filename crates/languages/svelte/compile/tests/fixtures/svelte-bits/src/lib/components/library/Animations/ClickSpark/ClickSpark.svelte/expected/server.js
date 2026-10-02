import * as $ from 'svelte/internal/server';

export default function ClickSpark($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			sparkColor = '#fff',
			sparkSize = 10,
			sparkRadius = 15,
			sparkCount = 8,
			duration = 400,
			easing = 'ease-out',
			extraScale = 1.0,
			class: className = ''
		} = $$props;

		let canvas;
		let wrapper;
		const sparks = [];

		function easeFunc(t) {
			switch (easing) {
				case 'linear':
					return t;

				case 'ease-in':
					return t * t;

				case 'ease-in-out':
					return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

				default:
					return t * (2 - t);
			}
		}

		function handleClick(e) {
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const now = performance.now();

			for (let i = 0; i < sparkCount; i++) {
				sparks.push({ x, y, angle: 2 * Math.PI * i / sparkCount, startTime: now });
			}
		}

		$$renderer.push(`<div role="presentation"${$.attr_class(`relative w-full h-full ${$.stringify(className)}`)}><canvas class="absolute inset-0 pointer-events-none"></canvas> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}