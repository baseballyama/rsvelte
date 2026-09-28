import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Showcase from './_Showcase.svelte';
import Keys from './_Keys.svelte';
import Forms from './_Forms.svelte';
import Invalid from './_Invalid.svelte';
import Standard from './_Standard.svelte';
import Filled from './_Filled.svelte';
import Outlined from './_Outlined.svelte';
import ShapedFilled from './_ShapedFilled.svelte';
import ShapedOutlined from './_ShapedOutlined.svelte';
import Required from './_Required.svelte';
import Disabled from './_Disabled.svelte';
import ConditionalIcon from './_ConditionalIcon.svelte';

export default function _page($$renderer) {
	$.head('1cf6sxh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Select - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-1cf6sxh"><h2 class="svelte-1cf6sxh">Select</h2> <h5 class="svelte-1cf6sxh">Installation</h5> <pre class="demo-spaced svelte-1cf6sxh">npm i -D @smui/select</pre> <h5 class="svelte-1cf6sxh">Demos</h5> `);
	Demo($$renderer, { component: Showcase, file: 'select/_Showcase.svelte' });
	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->If your options aren't strings, you must provide a <code class="svelte-1cf6sxh">key</code> function
      that converts them to unique strings, or the label may misbehave.`);
		}

		Demo($$renderer, {
			component: Keys,
			file: 'select/_Keys.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Using Keys`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->If you put a <code class="svelte-1cf6sxh">Select</code> in a <code class="svelte-1cf6sxh">&lt;form></code>, you have
      to add the <code class="svelte-1cf6sxh">hiddenInput</code> and <code class="svelte-1cf6sxh">input$name</code> props to have
      it sent with the rest of the inputs.`);
		}

		Demo($$renderer, {
			component: Forms,
			file: 'select/_Forms.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Using Forms`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Invalid,
		file: 'select/_Invalid.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dynamic Invalid State`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Standard,
		file: 'select/_Standard.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Filled,
		file: 'select/_Filled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Outlined,
		file: 'select/_Outlined.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Styled with CSS`);
		}

		Demo($$renderer, {
			component: ShapedFilled,
			file: 'select/_ShapedFilled.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Shaped Filled`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Styled with CSS`);
		}

		Demo($$renderer, {
			component: ShapedOutlined,
			file: 'select/_ShapedOutlined.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Shaped Outlined`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Required,
		file: 'select/_Required.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Required`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Disabled,
		file: 'select/_Disabled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ConditionalIcon,
		file: 'select/_ConditionalIcon.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Conditional icon`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}