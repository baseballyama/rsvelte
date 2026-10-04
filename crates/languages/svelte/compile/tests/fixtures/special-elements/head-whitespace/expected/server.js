import * as $ from 'svelte/internal/server';

export default function Head_whitespace($$renderer) {
	$.head('qw3wt0', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>  Hello  </title>`);
		});
	});
}
