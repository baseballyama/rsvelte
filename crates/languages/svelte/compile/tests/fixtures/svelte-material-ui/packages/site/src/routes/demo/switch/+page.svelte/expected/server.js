import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Group from './_Group.svelte';
import NoIcons from './_NoIcons.svelte';
import Events from './_Events.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('6xow65', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Switch - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Switch</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/switch</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'switch/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'switch/_SecondaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Group,
		file: 'switch/_Group.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Group switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Think about your <a href="https://developer.chrome.com/blog/new-in-devtools-83/#vision-deficiencies" target="_blank">color</a> <a href="https://developer.mozilla.org/en-US/docs/Tools/Accessibility_inspector/Simulation" target="_blank">blind</a> users before you choose this.`);
		}

		Demo($$renderer, {
			component: NoIcons,
			file: 'switch/_NoIcons.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->No icons`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Events,
		file: 'switch/_Events.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Events`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['switch/_Colored.svelte', 'switch/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}