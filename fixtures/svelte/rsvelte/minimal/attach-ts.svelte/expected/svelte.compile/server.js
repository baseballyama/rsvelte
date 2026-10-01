import * as $ from 'svelte/internal/server';

export default function Attach_ts($$renderer) {
	let size = 12;

	const grow = (node) => {
		node.style.fontSize = `${size}px`;
	};

	function label(text) {
		return (node) => {
			node.ariaLabel = text;
		};
	}

	$$renderer.push(`<p>sized</p> <button>+</button> <div></div> <span></span>`);
}