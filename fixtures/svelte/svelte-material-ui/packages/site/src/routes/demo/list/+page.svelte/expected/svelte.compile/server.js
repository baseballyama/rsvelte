import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import GraphicsDense from './_GraphicsDense.svelte';
import NonInteractive from './_NonInteractive.svelte';
import TwoLineSelection from './_TwoLineSelection.svelte';
import ThreeLine from './_ThreeLine.svelte';
import Groups from './_Groups.svelte';
import MultiLevel from './_MultiLevel.svelte';
import Radio from './_Radio.svelte';
import Check from './_Check.svelte';

export default function _page($$renderer) {
	$.head('i7bugd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Lists - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Lists</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/list</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'list/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: GraphicsDense,
		file: 'list/_GraphicsDense.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A dense list with graphics`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NonInteractive,
		file: 'list/_NonInteractive.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A non-interactive list with activated item`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: TwoLineSelection,
		file: 'list/_TwoLineSelection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A two-line single selection list with avatars, disabled item, and meta`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ThreeLine,
		file: 'list/_ThreeLine.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A three-line list`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Groups,
		file: 'list/_Groups.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A list group`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: MultiLevel,
		file: 'list/_MultiLevel.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A multi-level list`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Radio,
		file: 'list/_Radio.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A radio list`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Also, this uses the selection change event. Try CTRL+A and shift clicking.`);
		}

		Demo($$renderer, {
			component: Check,
			file: 'list/_Check.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->A check list with trailing checkboxes`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}