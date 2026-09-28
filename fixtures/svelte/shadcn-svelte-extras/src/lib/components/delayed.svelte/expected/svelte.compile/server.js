import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Delayed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { delay, children } = $$props;
		let visible = false;

		onMount(() => {
			const timeout = setTimeout(
				() => {
					visible = true;
				},
				delay
			);

			return () => clearTimeout(timeout);
		});

		if (visible) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}