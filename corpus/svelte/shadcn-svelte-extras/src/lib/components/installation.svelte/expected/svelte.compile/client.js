import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import JsrepoCommand from './docs/jsrepo-command.svelte';
import { h2 as MarkdownH2 } from '$lib/components/mdsx';

var root = $.from_html(`<!> <!>`, 1);

export default function Installation($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	MarkdownH2(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Installation');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ['jsrepo', 'add', $$props.specifier]);

		JsrepoCommand(node_1, {
			command: 'execute',
			get args() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
}