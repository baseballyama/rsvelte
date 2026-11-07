import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function tooltip(node, text) {
		let tooltip = null;

		function onMouseEnter() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			node.parentNode.appendChild(tooltip);
		}

		function onMouseLeave() {
			if (!tooltip) return;

			tooltip.remove();
			tooltip = null;
		}

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);

		return {
			destroy() {
				node.removeEventListener('mouseenter', onMouseEnter);
				node.removeEventListener('mouseleave', onMouseLeave);
			}
		};
	}

	$$renderer.push(`<button>action</button>`);
}