import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher, mode, setMode, setTheme } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<!> <main class="p-4"><div class="pb-4 text-right"><input type="checkbox" class="toggle"/></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	$.head('6phcou', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var input = $.child(div);

	$.remove_input_defaults(input);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(main);
	$.template_effect(() => $.set_checked(input, mode.current === 'dark'));

	$.delegated('change', input, (e) => {
		// daisyUI switches its palette (and `color-scheme`) via `data-theme`, so keep it in
		// sync with mode-watcher's light/dark mode. Setting both means mode-watcher's inline
		// `color-scheme` and daisyUI's agree, so `light-dark()` (e.g. LayerChart's Tooltip)
		// resolves correctly. mode-watcher persists both and sets them pre-paint (no flash).
		const theme = e.currentTarget.checked ? 'dark' : 'light';

		setMode(theme); // `.dark` class + inline `color-scheme` (drives `light-dark()`)
		setTheme(theme); // daisyUI `data-theme` (drives its palette)
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change']);