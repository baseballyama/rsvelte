import * as $ from 'svelte/internal/server';

export default function Element_xmlns($$renderer, $$props) {
	let { ns, tag } = $$props;
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr('xmlns', ns)}`);
	});
}
