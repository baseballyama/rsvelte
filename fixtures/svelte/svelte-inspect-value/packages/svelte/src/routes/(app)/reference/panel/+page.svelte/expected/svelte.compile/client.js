import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createPageTitle } from '$doclib/util.js';
import PanelExample from './PanelExample.svelte';
import PanelExampleCode from './PanelExampleCode.md';
import PanelPersistCode from './PanelPersistCode.md';

var root = $.from_html(
	`<h2 id="panel">Inspect.Panel</h2> <a href="/docs/types/PanelProps">Props</a> <p><code>Inspect.Panel</code> is a fixed-position version of <code>Inspect</code>.<br/> It can be resized, repositioned, customized and takes all the same props as <code>Inspect</code> does and a few extra ones.</p> <!> <!> <p><code>Inspect.Panel</code> will also render any children passed to it, a nice place to put any
  extra debugging tools or information. In fact, the navigation menu on this website is an instance
  of <code>Inspect.Panel</code> simply used for it's capability to render children.</p> <h2 id="global-values">Global values</h2> <p>In addition to using the <code>value</code> or <code>values</code>-props, panels can also receive "global" values with the utility function <a href="/docs/functions/addToPanel"><code>addToPanel</code></a> (experimental.)<br/> Also, if any instances of <code>Inspect</code> / <code>Inspect.Values</code> are used outside of a
  panel, you can add values to the panel from those instances.</p> <h2 id="persistence">Persisting State and Configuration</h2> <p>Using the <a href="/docs/types/PanelProps#persist"><code>persist</code></a>-prop, the following
  properties can be persisted using local/session storage:</p> <ul><li>open/closed state</li> <li>width/height (when resized)</li> <li>position</li> <li>opacity</li> <li>appearance</li></ul> <h3>Example</h3> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	$.head('1dzkg3s', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Inspect.Panel')]
		);
	});

	var node = $.sibling($.first_child(fragment), 6);

	PanelExample(node, {});

	var node_1 = $.sibling(node, 2);

	PanelExampleCode(node_1, {});

	var node_2 = $.sibling(node_1, 16);

	PanelPersistCode(node_2, {});
	$.append($$anchor, fragment);
	$.pop();
}