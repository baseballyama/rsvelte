import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import LeadingWithAction from './_LeadingWithAction.svelte';
import StackedWithAction from './_StackedWithAction.svelte';
import DynamicText from './_DynamicText.svelte';
import Colors from './_Colors.svelte';
import Kitchen from './_Kitchen.svelte';
import KitchenSvg from './_KitchenSvg.svelte';

export default function _page($$renderer) {
	$.head('k8nyue', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Snackbar - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Snackbar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/snackbar</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'snackbar/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: LeadingWithAction,
		file: 'snackbar/_LeadingWithAction.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Leading with action`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: StackedWithAction,
		file: 'snackbar/_StackedWithAction.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Stacked with action`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->This demo is set to not close automatically, so you can more easily test
      it.`);
		}

		Demo($$renderer, {
			component: DynamicText,
			file: 'snackbar/_DynamicText.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Using dynamic text`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colors,
		files: ['snackbar/_Colors.svelte', 'snackbar/_Colors.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored snackbars`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Kitchen,
		file: 'snackbar/_Kitchen.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->The "Kitchen" Snackbar generator`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: KitchenSvg,
		file: 'snackbar/_KitchenSvg.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Kitchen, with an SVG dismiss button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}