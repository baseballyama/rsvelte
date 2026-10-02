import * as $ from 'svelte/internal/server';

export default function Custom_css_transitions01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function fade(node, { delay = 0, duration = 400 }) {
			const o = +getComputedStyle(node).opacity;

			return { delay, duration, css: (t) => `opacity: ${t * o}` };
		}

		let visible = true;

		function spin(node, { duration }) {
			return { duration, css: (t) => `` };
		}

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

		if (visible) {
			$$renderer.push(`<!--[0--><div class="centered svelte-1lcbgpd"><span class="svelte-1lcbgpd">transitions!</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}