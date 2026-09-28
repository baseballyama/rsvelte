import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from '$doclib/Code.svelte';
import ConfiguredExample from '$doclib/examples/ConfiguredExample.svelte';
import MinimalExampleValues from '$doclib/examples/MinimalExampleValues.svelte';
import configuredCode from '$doclib/examples/configured.txt?raw';
import inlineconfigcode from '$doclib/examples/inlineconfig.txt?raw';
import valuesCode from '$doclib/examples/inspectvalueexample.txt?raw';
import { createPageTitle } from '$doclib/util.js';

var root = $.from_html(`<a> </a> <hr/>`, 1);

var root_1 = $.from_html(
	`<div class="toc"></div> <h2 id="values">Inspect.Values</h2> <p><code>Inspect.Values</code> is a version of <code>Inspect</code> that will display any prop/value
  passed to it, instead of having to use the <code>value(s)</code> prop.</p> <!> Result: <div class="center"><!></div> <h2 id="configuring">Configuring</h2> <p><code>Inspect.Values</code> does not accept any configuration props since any value passed as a
  prop will simply be inspected. If you want to change the behavior of <code>Inspect.Values</code> you can use <a href="/docs/functions/setGlobalInspectOptions">global options</a> or define a
  pre-configured version of the component with <code>Inspect.Values.withOptions</code> or the <code><a href="/docs/functions/configured">configured</a></code>-function:</p> <!> <p><code>Inspect.Values</code> and configured variants can all have <code>expandLevel</code> set by using
  "Expand" properties from 0 to 10 (default 1.)</p> Result: <div class="center"><!></div> <h2 id="chainable">Chainable inline configuration</h2> <p>A final method to configuring <code>Inspect.Values</code> that will override global options and <code>withOptions</code>-variations is "chainable inline configuration":</p> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const toc = new Map([
		['Configuring', 'configuring'],
		['Chainable inline configuration', 'chainable']
	]);

	var fragment = root_1();

	$.head('1rr3cki', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Inspect.Values')]
		);
	});

	var div = $.first_child(fragment);

	$.each(div, 21, () => toc, ([title, id]) => id, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let title = () => $.get($$array)[0];
		let id = () => $.get($$array)[1];
		var fragment_1 = root();
		var a = $.first_child(fragment_1);
		var text = $.only_child(a, true);

		$.next(2);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `#${id()}`);
			$.set_text(text, title());
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(div);

	var node = $.sibling(div, 6);

	Code(node, {
		get code() {
			return valuesCode;
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	MinimalExampleValues(node_1, {});
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 6);

	Code(node_2, {
		get code() {
			return configuredCode;
		}
	});

	var div_2 = $.sibling(node_2, 4);
	var node_3 = $.child(div_2);

	ConfiguredExample(node_3, {});
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 6);

	Code(node_4, {
		get code() {
			return inlineconfigcode;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}