import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { tag } = $$props;

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`ok`);
	});
}