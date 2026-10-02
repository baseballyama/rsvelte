import * as $ from 'svelte/internal/server';

export default function A($$renderer, $$props) {
	let { name, content } = $$props;

	$.head('6p7wes', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta${$.attr('name', name)}${$.attr('content', content)}/>`);
	});
}