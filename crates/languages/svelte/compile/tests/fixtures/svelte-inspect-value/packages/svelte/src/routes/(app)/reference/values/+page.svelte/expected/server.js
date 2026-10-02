import * as $ from 'svelte/internal/server';
import Code from '$doclib/Code.svelte';
import ConfiguredExample from '$doclib/examples/ConfiguredExample.svelte';
import MinimalExampleValues from '$doclib/examples/MinimalExampleValues.svelte';
import configuredCode from '$doclib/examples/configured.txt?raw';
import inlineconfigcode from '$doclib/examples/inlineconfig.txt?raw';
import valuesCode from '$doclib/examples/inspectvalueexample.txt?raw';
import { createPageTitle } from '$doclib/util.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const toc = new Map([
			['Configuring', 'configuring'],
			['Chainable inline configuration', 'chainable']
		]);

		$.head('1rr3cki', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('Inspect.Values'))}</title>`);
			});
		});

		$$renderer.push(`<div class="toc"><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [title, id] = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `#${id}`)}>${$.escape(title)}</a> <hr/>`);
		}

		$$renderer.push(`<!--]--></div> <h2 id="values">Inspect.Values</h2> <p><code>Inspect.Values</code> is a version of <code>Inspect</code> that will display any prop/value
  passed to it, instead of having to use the <code>value(s)</code> prop.</p> `);

		Code($$renderer, { code: valuesCode });
		$$renderer.push(`<!----> Result: <div class="center">`);
		MinimalExampleValues($$renderer, {});

		$$renderer.push(`<!----></div> <h2 id="configuring">Configuring</h2> <p><code>Inspect.Values</code> does not accept any configuration props since any value passed as a
  prop will simply be inspected. If you want to change the behavior of <code>Inspect.Values</code> you can use <a href="/docs/functions/setGlobalInspectOptions">global options</a> or define a
  pre-configured version of the component with <code>Inspect.Values.withOptions</code> or the <code><a href="/docs/functions/configured">configured</a></code>-function:</p> `);

		Code($$renderer, { code: configuredCode });

		$$renderer.push(`<!----> <p><code>Inspect.Values</code> and configured variants can all have <code>expandLevel</code> set by using
  "Expand" properties from 0 to 10 (default 1.)</p> Result: <div class="center">`);

		ConfiguredExample($$renderer, {});
		$$renderer.push(`<!----></div> <h2 id="chainable">Chainable inline configuration</h2> <p>A final method to configuring <code>Inspect.Values</code> that will override global options and <code>withOptions</code>-variations is "chainable inline configuration":</p> `);
		Code($$renderer, { code: inlineconfigcode });
		$$renderer.push(`<!---->`);
	});
}