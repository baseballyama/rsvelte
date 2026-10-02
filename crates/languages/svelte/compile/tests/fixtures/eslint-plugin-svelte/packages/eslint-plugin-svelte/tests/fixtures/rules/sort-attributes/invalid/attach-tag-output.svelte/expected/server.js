import * as $ from 'svelte/internal/server';

export default function Attach_tag_output($$renderer) {
	const myAttachment = (element) => {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	};

	$$renderer.push(`<div foo="">...</div>`);
}