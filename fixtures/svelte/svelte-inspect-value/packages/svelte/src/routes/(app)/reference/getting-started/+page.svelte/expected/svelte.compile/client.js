import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from '$doclib/Code.svelte';
import globalConfigCode from '$doclib/examples/globalconfig.txt?raw';
import globalConfigCodeLayout from '$doclib/examples/globalconfiglayout.txt?raw';
import MinimalExample from '$doclib/examples/MinimalExample.svelte';
import minimalcode from '$doclib/examples/minimalexample.txt?raw';
import MultiCode from '$doclib/examples/MultiCode.svelte';
import { createPageTitle } from '$doclib/util.js';
import Inspect from '$lib/index.js';
import { SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<a> </a> <hr/>`, 1);

var root_1 = $.from_html(
	`<div class="toc"></div> <h2 id="getting-started">Getting Started</h2> <p>Install <code></code> with your favorite package manager.<br/> Importing <code>Inspect</code> from <code></code> makes three components available:<br/> <code>Inspect</code>, <code>Inspect.Panel</code>, and <code>Inspect.Values</code></p> <h3 id="usage">Usage & Conditional Rendering</h3> <p>A common use case for a component like this is to only render it during development.<br/>If you
  are using SvelteKit, you can conditionally render Inspect using the <code>dev</code> variable
  exported from <code>'$app/environment'</code>.<br/> If you are not using SvelteKit or Vite, <a href="https://github.com/benmccann/esm-env/tree/main"><code>esm-env</code></a> is a good alternative
  for checking conditional environment variables with different bundlers and runtimes.</p> <!> <h3>Result:</h3> <div class="center svelte-1ak5ooi"><!></div> <h3 id="global">Global Options</h3> <p><code></code> exports a utility function to set a "global" config for every instance
  of the Inspect-components in or under the component where the function is called (it sets
  context). Alternatively, you can use the <code>InspectOptionsProvider</code>-component.</p> <p>Passing a function returning a reactive object to the function will update the components if any
  property of the object is changed.<br/> You can try this now if you change any options in the configurator at the bottom of the
  navigation-menu.</p> <!> Result: <label>string collapse <input type="number"/></label> <!> <p>Options set with props, <code><a href="/docs/types/Configurable#with-options">Inspect.Values.withOptions</a></code> or <code><a href="/docs/functions/configured">configured</a></code> will override any global options</p>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let $$d = $.derived(() => $$props.data.codeSamples),
		minimalCode = $.derived(() => $.get($$d).minimalCode);

	const packageName = 'svelte-inspect-value';
	let stringCollapse = $.state(20);

	const toc = new SvelteMap([
		['Usage & Conditional Rendering', 'usage'],
		['Global Options', 'global']
	]);

	var fragment = root_1();

	$.head('1ak5ooi', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Getting Started')]
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

	var p = $.sibling(div, 4);
	var code = $.sibling($.child(p));

	code.textContent = 'svelte-inspect-value';

	var code_1 = $.sibling(code, 6);

	code_1.textContent = 'svelte-inspect-value';
	$.next(8);
	$.reset(p);

	var node = $.sibling(p, 6);

	Code(node, {
		get code() {
			return minimalcode;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.html(node_1, () => $.get(minimalCode));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 4);
	var node_2 = $.child(div_1);

	MinimalExample(node_2, {});
	$.reset(div_1);

	var p_1 = $.sibling(div_1, 4);
	var code_2 = $.child(p_1);

	code_2.textContent = 'svelte-inspect-value';
	$.next(3);
	$.reset(p_1);

	var node_3 = $.sibling(p_1, 4);

	{
		let $0 = $.derived(() => [
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
		]);

		MultiCode(node_3, {
			get examples() {
				return $.get($0);
			}
		});
	}

	var label = $.sibling(node_3, 2);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var node_4 = $.sibling(label, 2);

	Inspect(node_4, {
		value: 'no long strings in this neighbourhood thanks',
		get stringCollapse() {
			return $.get(stringCollapse);
		}
	});

	$.next(2);
	$.bind_value(input, () => $.get(stringCollapse), ($$value) => $.set(stringCollapse, $$value));
	$.append($$anchor, fragment);
	$.pop();
}