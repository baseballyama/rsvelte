import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const filesState = { files: {} };
		let nodes = { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] };

		filesState.files = nodes;

		function test() {
			filesState.files.items[0].parent = filesState.files;
		}
	});
}