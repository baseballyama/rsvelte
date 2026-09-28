import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { data } = $$props;

	if (data.content) {
		$$renderer.push('<!--[-->');
		data.content($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}