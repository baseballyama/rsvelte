import * as $ from 'svelte/internal/server';

export default function Attach_ts_01_input($$renderer) {
	const myAttachment = (element) => {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	};

	$$renderer.push(`<div>...</div>`);
}