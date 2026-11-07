import * as $ from 'svelte/internal/server';
import { onDestroy, tick } from 'svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const shapes = [
			'circle',
			'squircle',
			'triangle-up',
			'triangle-down',
			'triangle-right',
			'triangle-left',
			'diamond',
			'pentagon',
			'hexagon',
			'cube',
			'octagon',
			'decagon',
			'star',
			'heart',
			'cross'
		];

		let index = 0;

		const intervalId = setInterval(
			() => {
				const update = async () => {
					index = (index + 1) % shapes.length;
					await tick();
				};

				if (typeof document !== 'undefined' && 'startViewTransition' in document) {
					document.startViewTransition(update);
				} else {
					update();
				}
			},
			2000
		);

		onDestroy(() => clearInterval(intervalId));
		$$renderer.push(`<img${$.attr_class(`mask mask-${$.stringify(shapes[index])} w-32`)} src="https://i.pravatar.cc/150?img=48" alt="Avatar"${$.attr_style('', { 'view-transition-name': 'mask-default' })}/>`);
	});
}