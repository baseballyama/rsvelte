import * as $ from 'svelte/internal/server';
import Code from '$doclib/Code.svelte';
import globalConfigCode from '$doclib/examples/globalconfig.txt?raw';
import globalConfigCodeLayout from '$doclib/examples/globalconfiglayout.txt?raw';
import MinimalExample from '$doclib/examples/MinimalExample.svelte';
import minimalcode from '$doclib/examples/minimalexample.txt?raw';
import MultiCode from '$doclib/examples/MultiCode.svelte';
import { createPageTitle } from '$doclib/util.js';
import Inspect from '$lib/index.js';
import { SvelteMap } from 'svelte/reactivity';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		let $$d = $.derived(() => data.codeSamples),
			minimalCode = $.derived(() => $$d().minimalCode);

		const packageName = 'svelte-inspect-value';
		let stringCollapse = 20;

		const toc = new SvelteMap([
			['Usage & Conditional Rendering', 'usage'],
			['Global Options', 'global']
		]);

		$.head('1ak5ooi', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('Getting Started'))}</title>`);
			});
		});

		$$renderer.push(`<div class="toc"><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [title, id] = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `#${id}`)}>${$.escape(title)}</a> <hr/>`);
		}

		$$renderer.push(`<!--]--></div> <h2 id="getting-started">Getting Started</h2> <p>Install <code>svelte-inspect-value</code> with your favorite package manager.<br/> Importing <code>Inspect</code> from <code>svelte-inspect-value</code> makes three components available:<br/> <code>Inspect</code>, <code>Inspect.Panel</code>, and <code>Inspect.Values</code></p> <h3 id="usage">Usage &amp; Conditional Rendering</h3> <p>A common use case for a component like this is to only render it during development.<br/>If you
  are using SvelteKit, you can conditionally render Inspect using the <code>dev</code> variable
  exported from <code>'$app/environment'</code>.<br/> If you are not using SvelteKit or Vite, <a href="https://github.com/benmccann/esm-env/tree/main"><code>esm-env</code></a> is a good alternative
  for checking conditional environment variables with different bundlers and runtimes.</p> `);

		Code($$renderer, {
			code: minimalcode,
			children: ($$renderer) => {
				$$renderer.push(`${$.html(minimalCode())}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h3>Result:</h3> <div class="center svelte-1ak5ooi">`);
		MinimalExample($$renderer, {});

		$$renderer.push(`<!----></div> <h3 id="global">Global Options</h3> <p><code>svelte-inspect-value</code> exports a utility function to set a "global" config for every instance
  of the Inspect-components in or under the component where the function is called (it sets
  context). Alternatively, you can use the <code>InspectOptionsProvider</code>-component.</p> <p>Passing a function returning a reactive object to the function will update the components if any
  property of the object is changed.<br/> You can try this now if you change any options in the configurator at the bottom of the
  navigation-menu.</p> `);

		MultiCode($$renderer, {
			examples: [
				{
					code: globalConfigCodeLayout,
					label: '+layout.svelte',
					language: 'svelte'
				},

				{
					code: globalConfigCode,
					label: '+page.svelte',
					language: 'svelte'
				}
			]
		});

		$$renderer.push(`<!----> Result: <label>string collapse <input type="number"${$.attr('value', stringCollapse)}/></label> `);

		Inspect($$renderer, {
			value: 'no long strings in this neighbourhood thanks',
			stringCollapse
		});

		$$renderer.push(`<!----> <p>Options set with props, <code><a href="/docs/types/Configurable#with-options">Inspect.Values.withOptions</a></code> or <code><a href="/docs/functions/configured">configured</a></code> will override any global options</p>`);
	});
}