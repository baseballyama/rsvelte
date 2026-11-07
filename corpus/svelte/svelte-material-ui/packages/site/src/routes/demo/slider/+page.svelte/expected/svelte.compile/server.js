import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Continuous from './_Continuous.svelte';
import Discrete from './_Discrete.svelte';
import TickMarks from './_TickMarks.svelte';
import Range from './_Range.svelte';
import MinRange from './_MinRange.svelte';
import DiscreteRange from './_DiscreteRange.svelte';
import Disabled from './_Disabled.svelte';

export default function _page($$renderer) {
	$.head('1j2ytac', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Slider - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Slider</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/slider</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'slider/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Continuous,
		file: 'slider/_Continuous.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Continuous`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Discrete,
		file: 'slider/_Discrete.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Discrete with min/max/step`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: TickMarks,
		file: 'slider/_TickMarks.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Adding tick marks to discrete`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Range,
		file: 'slider/_Range.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Range slider`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Limit the range the user can select to a minimum value.`);
		}

		Demo($$renderer, {
			component: MinRange,
			file: 'slider/_MinRange.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Min range slider`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: DiscreteRange,
		file: 'slider/_DiscreteRange.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Discrete range slider with tick marks`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Disabled,
		file: 'slider/_Disabled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}