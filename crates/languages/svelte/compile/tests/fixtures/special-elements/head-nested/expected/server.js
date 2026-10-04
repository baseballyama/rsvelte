import * as $ from 'svelte/internal/server';

export default function Head_nested($$renderer) {
	let show = true;
	$.head('12tw8ly', $$renderer, ($$renderer) => {
		if (show) {
			$$renderer.push('<!--[0-->');
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Shown</title>`);
			});
			$$renderer.push(`<meta name="test" content="shown"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}
		$$renderer.push(`<!--]-->`);
	});
	$$renderer.push(`<p>Body</p>`);
}
