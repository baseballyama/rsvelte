import * as $ from 'svelte/internal/server';

export default function Custom_js_transitions_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visible = false;

		function typewriter(node, { speed = 50 }) {
			const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

			if (!valid) {
				throw new Error(`This transition only works on elements with a single text node child`);
			}

			const text = node.textContent;
			const duration = text.length * speed;

			return {
				duration,
				tick: (t) => {
					const i = ~~(text.length * t);

					node.textContent = text.slice(0, i);
				}
			};
		}

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

		if (visible) {
			$$renderer.push(`<!--[0--><p>The quick brown fox jumps over the lazy dog</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}