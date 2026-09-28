import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let container;

	function tooltip(node, text) {
		let tooltip = null;

		function onVisibilityChange() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			container.appendChild(tooltip);
		}

		node.addEventListener('visibilitychange', onVisibilityChange);

		return {
			destroy() {
				node.removeEventListener('visibilitychange', onVisibilityChange);
			}
		};
	}

	$$renderer.push(`<div></div>`);
}