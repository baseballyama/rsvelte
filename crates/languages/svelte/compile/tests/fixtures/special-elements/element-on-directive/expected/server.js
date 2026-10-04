import * as $ from 'svelte/internal/server';

export default function Element_on_directive($$renderer, $$props) {
	let { tag } = $$props;
	$.element($$renderer, tag);
}
