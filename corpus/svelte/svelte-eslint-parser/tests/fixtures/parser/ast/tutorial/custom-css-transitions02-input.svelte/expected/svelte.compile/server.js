import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { elasticOut } from 'svelte/easing';

export default function Custom_css_transitions02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visible = true;

		function spin(node, { duration }) {
			return {
				duration,
				css: (t) => {
					const eased = elasticOut(t);

					return `
					transform: scale(${eased}) rotate(${eased * 1080}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
				}
			};
		}

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

		if (visible) {
			$$renderer.push(`<!--[0--><div class="centered svelte-15k3bdq"><span class="svelte-15k3bdq">transitions!</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}