import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AllTypes from '$doclib/examples/AllTypes.svelte';
import { createPageTitle } from '$doclib/util.js';

const metaKey = ($$anchor) => {
	var kbd = root();

	$.append($$anchor, kbd);
};

var root = $.from_html(`<kbd><dfn title="⌘ or Ctrl">Meta</dfn></kbd>`);
var root_1 = $.from_html(`<a> </a> <hr/>`, 1);

var root_2 = $.from_html(
	`<div class="toc"></div> <h2 id="hotkeys">Hotkeys</h2> <h3 id="default">Default keyboard shortcuts and configuration</h3> <p>The three following hotkeys are enabled by default. They can be overriden or disabled by setting
  the <a href="/docs/types/InspectOptions#hotkeys"><code>hotkeys</code> prop / option</a>.<br/> See <a href="/docs/types/InspectHotkeys"><code>InspectHotkeys</code></a> type for how to override.</p> <table class="svelte-2i34iv"><tbody><tr><td class="svelte-2i34iv"><!> + <kbd>&rightarrow;</kbd></td><td class="svelte-2i34iv">Expand top level nodes</td></tr><tr><td class="svelte-2i34iv"><!> + <kbd>&leftarrow;</kbd></td><td class="svelte-2i34iv">Collapse top level nodes</td></tr><tr><td class="svelte-2i34iv"><kbd>Shift</kbd> + <!> + <kbd>F</kbd></td><td class="svelte-2i34iv">Focus search field (if enabled)</td></tr></tbody></table> <p style="font-weight: bold; font-style: italic">Note: <!> means <kbd>⌘</kbd> on macOS and <kbd>Ctrl</kbd> on Windows / Linux</p> <h3 id="keyboard">Keyboard navigation</h3> <p>Every node/row/line in <code>Inspect</code> is focusable, and can be navigated, expanded or
  collapsed using the following keys. Using <kbd>Tab</kbd> in combination with the following
  keyboard shortcuts, everything should be reachable using only your keyboard.<br/> This can be disabled by setting option / prop <code>disableKeyNav</code> to <code>true</code>.</p> <table class="svelte-2i34iv"><tbody><tr><td class="svelte-2i34iv"><kbd>&uparrow;</kbd></td><td class="svelte-2i34iv">Focus previous node</td></tr><tr><td class="svelte-2i34iv"><kbd>&downarrow;</kbd></td><td class="svelte-2i34iv">Focus next node</td></tr><tr><td class="svelte-2i34iv"><kbd>End</kbd></td><td class="svelte-2i34iv">Focus last node</td></tr><tr><td class="svelte-2i34iv"><kbd>Home</kbd></td><td class="svelte-2i34iv">Focus first node</td></tr><tr><td class="svelte-2i34iv"><kbd>&rightarrow;</kbd></td><td class="svelte-2i34iv">If collapsed: expand node<br/> If expanded: focus previously expanded child node<br/> Non expandable: focus next node</td></tr><tr><td class="svelte-2i34iv"><kbd>&leftarrow;</kbd></td><td class="svelte-2i34iv">If collapsed: focus parent node / focus previous node<br/> If expanded: collapse node<br/> Non expandable: focus previous mode</td></tr><tr><td class="svelte-2i34iv"><kbd>Enter</kbd></td><td class="svelte-2i34iv">Expand node and focus first child</td></tr><tr><td class="svelte-2i34iv"><kbd>Space</kbd></td><td class="svelte-2i34iv">Expand / collapse node</td></tr></tbody></table> <h3 id="type-to-focus">Type to focus</h3> <p>While a node is focused, you can type to focus a certain (visible) node.<br/> A box will appear showing your query, and a node matching the typed letters will be focused, prioritizing
  keys. This can be disabled by setting the prop / option <code>typeToFocus</code> to <code>false</code></p> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const toc = new Map([
		['Default Shortcuts', 'default'],
		['Keyboard Navigation', 'keyboard'],
		['Type to focus', 'type-to-focus']
	]);

	var fragment = root_2();

	$.head('2i34iv', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Hotkeys')]
		);
	});

	var div = $.first_child(fragment);

	$.each(div, 21, () => toc, ([title, id]) => id, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let title = () => $.get($$array)[0];
		let id = () => $.get($$array)[1];
		var fragment_1 = root_1();
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

	var table = $.sibling(div, 8);
	var tbody = $.child(table);
	var tr = $.child(tbody);
	var td = $.child(tr);
	var node = $.child(td);

	metaKey(node);
	$.next(2);
	$.reset(td);
	$.next();
	$.reset(tr);

	var tr_1 = $.sibling(tr);
	var td_1 = $.child(tr_1);
	var node_1 = $.child(td_1);

	metaKey(node_1);
	$.next(2);
	$.reset(td_1);
	$.next();
	$.reset(tr_1);

	var tr_2 = $.sibling(tr_1);
	var td_2 = $.child(tr_2);
	var node_2 = $.sibling($.child(td_2), 2);

	metaKey(node_2);
	$.next(2);
	$.reset(td_2);
	$.next();
	$.reset(tr_2);
	$.reset(tbody);
	$.reset(table);

	var p = $.sibling(table, 2);
	var node_3 = $.sibling($.child(p));

	metaKey(node_3);
	$.next(5);
	$.reset(p);

	var node_4 = $.sibling(p, 12);

	AllTypes(node_4, { search: 'highlight', disableKeynav: false });
	$.append($$anchor, fragment);
	$.pop();
}