import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import Exited from './_Exited.svelte';
import Mini from './_Mini.svelte';
import Extended from './_Extended.svelte';
import NoRipple from './_NoRipple.svelte';
import Link from './_Link.svelte';
import Svg from './_Svg.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('ahwvx4', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Floating Action Button - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-ahwvx4"><h2 class="svelte-ahwvx4">Floating Action Button</h2> <h5 class="svelte-ahwvx4">Installation</h5> <pre class="demo-spaced svelte-ahwvx4">npm i -D @smui/fab</pre> <h5 class="svelte-ahwvx4">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'fab/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: PrimaryColor,
		file: 'fab/_PrimaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Exited,
		file: 'fab/_Exited.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Exited`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Mini,
		file: 'fab/_Mini.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Mini`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Extended,
		file: 'fab/_Extended.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Extended`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NoRipple,
		file: 'fab/_NoRipple.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->No Ripple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Link,
		file: 'fab/_Link.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Svg,
		file: 'fab/_Svg.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Svg`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['fab/_Colored.svelte', 'fab/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}