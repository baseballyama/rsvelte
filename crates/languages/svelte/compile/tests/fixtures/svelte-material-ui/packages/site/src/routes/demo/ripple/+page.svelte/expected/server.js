import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Unbounded from './_Unbounded.svelte';
import KeyboardActivation from './_KeyboardActivation.svelte';

export default function _page($$renderer) {
	$.head('ue57c3', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Ripple - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Ripple</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/ripple</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'ripple/_Simple.svelte' });
	$$renderer.push(`<!----> `);
	Demo($$renderer, { component: PrimaryColor, file: 'ripple/_PrimaryColor.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'ripple/_SecondaryColor.svelte'
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Unbounded,
		file: 'ripple/_Unbounded.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Unbounded`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: KeyboardActivation,
		file: 'ripple/_KeyboardActivation.svelte'
	});

	$$renderer.push(`<!----></section>`);
}