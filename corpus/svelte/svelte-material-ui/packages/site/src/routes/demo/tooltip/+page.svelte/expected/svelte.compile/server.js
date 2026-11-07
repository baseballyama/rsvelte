import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Positioning from './_Positioning.svelte';
import Rich from './_Rich.svelte';
import Delayed from './_Delayed.svelte';
import Disappearing from './_Disappearing.svelte';

export default function _page($$renderer) {
	$.head('ejim2a', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Tooltip - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Toolip</h2> <p>Or tooltip. I can't spell.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/tooltip</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'tooltip/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Tooltips position themselves automatically based on proximity to the
      viewport boundary, but you can give them a default position.`);
		}

		Demo($$renderer, {
			component: Positioning,
			file: 'tooltip/_Positioning.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Positioning`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Rich,
		file: 'tooltip/_Rich.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Rich`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Delayed,
		file: 'tooltip/_Delayed.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Delayed`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Disappearing,
		file: 'tooltip/_Disappearing.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disappearing`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}