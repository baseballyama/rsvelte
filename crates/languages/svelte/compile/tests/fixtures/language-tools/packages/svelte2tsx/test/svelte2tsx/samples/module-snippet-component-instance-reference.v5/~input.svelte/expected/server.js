import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const { icon: Icon } = $$props;

	function iconSnippet($$renderer) {
		if (Icon) {
			$$renderer.push('<!--[-->');
			Icon($$renderer, { size: 16 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	iconSnippet($$renderer);
}