import * as $ from 'svelte/internal/server';
import AllTypes from '$doclib/examples/AllTypes.svelte';
import { createPageTitle } from '$doclib/util.js';

function metaKey($$renderer) {
	$$renderer.push(`<kbd><dfn title="⌘ or Ctrl">Meta</dfn></kbd>`);
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const toc = new Map([
			['Default Shortcuts', 'default'],
			['Keyboard Navigation', 'keyboard'],
			['Type to focus', 'type-to-focus']
		]);

		$.head('2i34iv', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('Hotkeys'))}</title>`);
			});
		});

		$$renderer.push(`<div class="toc"><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [title, id] = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `#${id}`)}>${$.escape(title)}</a> <hr/>`);
		}

		$$renderer.push(`<!--]--></div> <h2 id="hotkeys">Hotkeys</h2> <h3 id="default">Default keyboard shortcuts and configuration</h3> <p>The three following hotkeys are enabled by default. They can be overriden or disabled by setting
  the <a href="/docs/types/InspectOptions#hotkeys"><code>hotkeys</code> prop / option</a>.<br/> See <a href="/docs/types/InspectHotkeys"><code>InspectHotkeys</code></a> type for how to override.</p> <table class="svelte-2i34iv"><tbody><tr><td class="svelte-2i34iv">`);

		metaKey($$renderer);
		$$renderer.push(`<!----> + <kbd>→</kbd></td><td class="svelte-2i34iv">Expand top level nodes</td></tr><tr><td class="svelte-2i34iv">`);
		metaKey($$renderer);
		$$renderer.push(`<!----> + <kbd>←</kbd></td><td class="svelte-2i34iv">Collapse top level nodes</td></tr><tr><td class="svelte-2i34iv"><kbd>Shift</kbd> + `);
		metaKey($$renderer);
		$$renderer.push(`<!----> + <kbd>F</kbd></td><td class="svelte-2i34iv">Focus search field (if enabled)</td></tr></tbody></table> <p style="font-weight: bold; font-style: italic">Note: `);
		metaKey($$renderer);

		$$renderer.push(`<!----> means <kbd>⌘</kbd> on macOS and <kbd>Ctrl</kbd> on Windows / Linux</p> <h3 id="keyboard">Keyboard navigation</h3> <p>Every node/row/line in <code>Inspect</code> is focusable, and can be navigated, expanded or
  collapsed using the following keys. Using <kbd>Tab</kbd> in combination with the following
  keyboard shortcuts, everything should be reachable using only your keyboard.<br/> This can be disabled by setting option / prop <code>disableKeyNav</code> to <code>true</code>.</p> <table class="svelte-2i34iv"><tbody><tr><td class="svelte-2i34iv"><kbd>↑</kbd></td><td class="svelte-2i34iv">Focus previous node</td></tr><tr><td class="svelte-2i34iv"><kbd>↓</kbd></td><td class="svelte-2i34iv">Focus next node</td></tr><tr><td class="svelte-2i34iv"><kbd>End</kbd></td><td class="svelte-2i34iv">Focus last node</td></tr><tr><td class="svelte-2i34iv"><kbd>Home</kbd></td><td class="svelte-2i34iv">Focus first node</td></tr><tr><td class="svelte-2i34iv"><kbd>→</kbd></td><td class="svelte-2i34iv">If collapsed: expand node<br/> If expanded: focus previously expanded child node<br/> Non expandable: focus next node</td></tr><tr><td class="svelte-2i34iv"><kbd>←</kbd></td><td class="svelte-2i34iv">If collapsed: focus parent node / focus previous node<br/> If expanded: collapse node<br/> Non expandable: focus previous mode</td></tr><tr><td class="svelte-2i34iv"><kbd>Enter</kbd></td><td class="svelte-2i34iv">Expand node and focus first child</td></tr><tr><td class="svelte-2i34iv"><kbd>Space</kbd></td><td class="svelte-2i34iv">Expand / collapse node</td></tr></tbody></table> <h3 id="type-to-focus">Type to focus</h3> <p>While a node is focused, you can type to focus a certain (visible) node.<br/> A box will appear showing your query, and a node matching the typed letters will be focused, prioritizing
  keys. This can be disabled by setting the prop / option <code>typeToFocus</code> to <code>false</code></p> `);

		AllTypes($$renderer, { search: 'highlight', disableKeynav: false });
		$$renderer.push(`<!---->`);
	});
}