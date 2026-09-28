import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { convert_markdown_to_html } from '../utils';

var root = $.from_html(`<div class="main info-field svelte-1oatjoc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="svelte-1oatjoc"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg> <!></div>`);

export default function Information($$anchor, $$props) {
	$.push($$props, true);

	let field = $.prop($$props, 'field', 19, () => ({ config: { info: '' } }));
	let html = $.derived(() => convert_markdown_to_html(field().config?.info || ''));
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.html(node, () => $.get(html));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}