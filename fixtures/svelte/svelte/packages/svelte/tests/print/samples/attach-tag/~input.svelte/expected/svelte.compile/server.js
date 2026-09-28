import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const myAttachment = (element) => {
		console.log(element.nodeName);

		return () => {
			console.log('cleaning up');
		};
	};

	$$renderer.push(`<div>...</div>`);
}