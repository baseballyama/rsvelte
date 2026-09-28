import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Intersection_observer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			once = false,
			top = 0,
			bottom = 0,
			left = 0,
			right = 0,
			children
		} = $$props;

		let intersecting = false;
		let container = void 0;

		onMount(() => {
			if (typeof IntersectionObserver !== 'undefined') {
				const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

				const observer = new IntersectionObserver(
					(entries) => {
						intersecting = entries[0].isIntersecting;

						if (intersecting && once) {
							observer.unobserve(container);
						}
					},
					{ rootMargin }
				);

				observer.observe(container);

				return () => observer.unobserve(container);
			}
		});

		const children_render = $.derived(() => children);

		$$renderer.push(`<span>`);
		children_render()?.($$renderer, { intersecting });
		$$renderer.push(`<!----></span>`);
	});
}