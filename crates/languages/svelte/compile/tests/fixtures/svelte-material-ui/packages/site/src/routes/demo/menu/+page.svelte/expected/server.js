import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Anchored from './_Anchored.svelte';
import TwoLineManunalAnchor from './_TwoLineManunalAnchor.svelte';
import SelectionGroup from './_SelectionGroup.svelte';
import Portal from './_Portal.svelte';

export default function _page($$renderer) {
	$.head('63ewvm', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Menu - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Menu</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/menu</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Static, file: 'menu/_Static.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Anchored,
		file: 'menu/_Anchored.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Anchored automatically`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: TwoLineManunalAnchor,
		file: 'menu/_TwoLineManunalAnchor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Two line, anchored manually, corner set to bottom-left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SelectionGroup,
		file: 'menu/_SelectionGroup.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selection groups`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Using a svelte-portal to show a menu in a place where it normally couldn't
      go (due to DOM restrictions, hidden overflow, etc.).`);
		}

		Demo($$renderer, {
			component: Portal,
			file: 'menu/_Portal.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Portal`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> <div style="padding-top: 200px;">Long div for scrolling...</div></section>`);
}