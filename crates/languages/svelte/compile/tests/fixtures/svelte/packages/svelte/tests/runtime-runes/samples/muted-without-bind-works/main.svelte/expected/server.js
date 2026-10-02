import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let muted = false;

	function volume_change(node) {
		node.addEventListener("volumechange", () => {
			console.log(node.muted);
		});
	}

	$$renderer.push(`<audio${$.attr('muted', muted, true)}></audio> <button></button>`);
}