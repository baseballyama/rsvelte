import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '@skeletonlabs/skeleton-svelte';
import { ModeWatcher, mode, setMode } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<!> <main class="p-4"><div class="pb-4 text-right"><!></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	$.head('vw2t9l', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ModeWatcher(node, { defaultTheme: 'cerberus' });

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var node_1 = $.child(div);

	{
		let $0 = $.derived(() => mode.current === 'dark');

		Switch(node_1, {
			name: 'mode',
			get checked() {
				return $.get($0);
			},
			onCheckedChange: (e) => setMode(e.checked ? 'dark' : 'light')
		});
	}

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}