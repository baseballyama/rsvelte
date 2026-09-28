import * as $ from 'svelte/internal/server';
import IconA from './IconA.svelte';
import IconB from './IconB.svelte';

export default function Inner($$renderer, $$props) {
	let variable = false;

	$$renderer.push(`<button>Click Me</button> <div><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		if (variable ? IconA : IconB) {
			$$renderer.push('<!--[-->');
			(variable ? IconA : IconB)($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});

	$$renderer.push(`<!--]--></div>`);
}