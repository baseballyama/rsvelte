import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Multiple from './_Multiple.svelte';
import DisabledNonInteractive from './_DisabledNonInteractive.svelte';
import Extend from './_Extend.svelte';
import Description from './_Description.svelte';
import Icon from './_Icon.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Nested from './_Nested.svelte';
import PaperProps from './_PaperProps.svelte';
import Complex from './_Complex.svelte';

export default function _page($$renderer) {
	$.head('ca630h', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Accordion - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-ca630h"><h2 class="svelte-ca630h">Accordion</h2> <h5 class="svelte-ca630h">Installation</h5> <pre class="demo-spaced svelte-ca630h">npm i -D @smui-extra/accordion</pre> <h5 class="svelte-ca630h">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'accordion/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Allow multiple open panels.`);
		}

		Demo($$renderer, {
			component: Multiple,
			file: 'accordion/_Multiple.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Multiple`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: DisabledNonInteractive,
		file: 'accordion/_DisabledNonInteractive.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled and Non-Interactive Panels`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Description,
		file: 'accordion/_Description.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Descriptions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Icon,
		file: 'accordion/_Icon.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Toggle icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Extend,
		file: 'accordion/_Extend.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Extending panels`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: PrimaryColor,
		file: 'accordion/_PrimaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'accordion/_SecondaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Nested,
		file: 'accordion/_Nested.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Nested`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->The panels are Paper components, so they can take any property that Paper
      can.`);
		}

		Demo($$renderer, {
			component: PaperProps,
			file: 'accordion/_PaperProps.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Paper props`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Complex,
		file: 'accordion/_Complex.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Complex content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}