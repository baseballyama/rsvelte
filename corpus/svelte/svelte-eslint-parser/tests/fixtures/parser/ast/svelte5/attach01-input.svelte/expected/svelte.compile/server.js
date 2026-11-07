import * as $ from 'svelte/internal/server';

export default function Attach01_input($$renderer) {
	/** @type {import('svelte/attachments').Attachment} */
	function myAttachment(element) {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	}

	$$renderer.push(`<div>...</div>`);
}