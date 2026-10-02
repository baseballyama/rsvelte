import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import FourByFive from './_FourByFive.svelte';
import Masonry from './_Masonry.svelte';
import EnforceAspectRatio from './_EnforceAspectRatio.svelte';

export default function _page($$renderer) {
	$.head('duub1t', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Image Lists - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Image Lists</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/image-list</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: Simple,
		files: ['image-list/_Simple.svelte', 'image-list/_Simple.scss']
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FourByFive,
		files: [
			'image-list/_FourByFive.svelte',
			'image-list/_FourByFive.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->4x5 aspect ratio, with text protection`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Masonry,
		files: ['image-list/_Masonry.svelte', 'image-list/_Masonry.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Masonry, with rounded shapes`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: EnforceAspectRatio,
		files: [
			'image-list/_EnforceAspectRatio.svelte',
			'image-list/_EnforceAspectRatio.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Using a <code>div</code> instead of an <code>img</code> to enforce aspect ratio`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}