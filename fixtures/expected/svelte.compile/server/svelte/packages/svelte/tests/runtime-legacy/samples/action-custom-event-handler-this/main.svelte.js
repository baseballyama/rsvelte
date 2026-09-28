import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function enter(node, callback) {
		function handleKeydown(event) {
			if (event.key === 'Enter') {
				callback(event);
			}
		}

		node.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}

	$$renderer.push(`<input/>`);
}