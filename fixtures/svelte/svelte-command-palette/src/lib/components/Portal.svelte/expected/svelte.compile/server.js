import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { target = 'body', children } = $$props;

		const portal = (node, targetSelector) => {
			async function update(targetSelector) {
				let targetElement = document.querySelector(targetSelector);

				if (targetElement === null) {
					await tick();
					targetElement = document.querySelector(targetSelector);
				}

				if (targetElement === null) {
					throw new Error('No element found matching selector');
				}

				targetElement.appendChild(node);
			}

			function destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}

			update(targetSelector);

			return { update, destroy };
		};

		$$renderer.push(`<div>`);

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