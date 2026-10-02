import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, 'p', void 0, () => {
		$.element($$renderer, 'p');
	});
}