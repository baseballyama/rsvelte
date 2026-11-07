import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Toggle from './_Toggle.svelte';
import Svgs from './_Svgs.svelte';
import Touch from './_Touch.svelte';
import Sizes from './_Sizes.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('kfx2iv', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Icon Button - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Icon Button</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/icon-button</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'icon-button/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Toggle,
		file: 'icon-button/_Toggle.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Toggle buttons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Svgs,
		file: 'icon-button/_Svgs.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Using SVGs`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Touch,
		file: 'icon-button/_Touch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Increased touch target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Sizes,
		file: 'icon-button/_Sizes.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Different sizes`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['icon-button/_Colored.svelte', 'icon-button/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}