import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Variants from './_Variants.svelte';
import Touch from './_Touch.svelte';
import Icons from './_Icons.svelte';
import Link from './_Link.svelte';
import Groups from './_Groups.svelte';
import SplitButtons from './_SplitButtons.svelte';
import Colored from './_Colored.svelte';
import Round from './_Round.svelte';
import Notched from './_Notched.svelte';
import CustomTag from './_CustomTag.svelte';

export default function _page($$renderer) {
	$.head('d3xzgl', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Button - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-d3xzgl"><h2 class="svelte-d3xzgl">Button</h2> <h5 class="svelte-d3xzgl">Installation</h5> <pre class="demo-spaced svelte-d3xzgl">npm i -D @smui/button</pre> <h5 class="svelte-d3xzgl">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'button/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'button/_SecondaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Variants,
		file: 'button/_Variants.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Variants`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Touch,
		file: 'button/_Touch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Increased touch target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Icons,
		file: 'button/_Icons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Link,
		file: 'button/_Link.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Groups,
		file: 'button/_Groups.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button groups`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SplitButtons,
		file: 'button/_SplitButtons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Split buttons using a button group`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['button/_Colored.svelte', 'button/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Round,
		files: ['button/_Round.svelte', 'button/_Round.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Creating rounded buttons with Sass mixins`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Notched,
		files: ['button/_Notched.svelte', 'button/_Notched.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Creating notched buttons with Sass`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: CustomTag,
		file: 'button/_CustomTag.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom HTML tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}