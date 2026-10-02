import * as $ from 'svelte/internal/server';

export default function Attach($$renderer) {
	let count = 0;
	function tooltip(node) {
		node.title = 'hi';
		return () => {
			node.title = '';
		};
	}
	function color(c) {
		return (node) => {
			node.style.color = c;
		};
	}
	$$renderer.push(`<div>static</div> <p>${$.escape(count)}</p> <button>add</button> <span></span>`);
}
