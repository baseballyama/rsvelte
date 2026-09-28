import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Typography from './_Typography.svelte';

export default function _page($$renderer) {
	$.head('110kll4', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Typography - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Typography</h2> <p>Part of <code>@smui/common</code>.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: Typography,
		files: [
			'typography/_Typography.svelte',
			'typography/_Typography.scss'
		]
	});

	$$renderer.push(`<!----></section>`);
}