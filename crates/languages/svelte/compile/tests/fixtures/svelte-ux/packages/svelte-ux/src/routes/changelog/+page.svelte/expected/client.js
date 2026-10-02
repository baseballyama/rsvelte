import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { marked } from 'marked';
import { TableOfContents } from 'svelte-ux';
import changelog from '../../../CHANGELOG.md?raw';

var root = $.from_html(`<div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4"><div class="bg-surface-100 p-2 m-2 rounded shadow-lg border overflow-auto"><div class="prose px-4"></div></div> <div class="hidden lg:block w-[224px]"><div class="sticky top-[var(--headerHeight)] pr-2 max-h-[calc(100vh-64px)] overflow-auto"><div class="text-xs uppercase leading-8 tracking-widest text-surface-content/50">On this page</div> <!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function sanitize(str) {
		return str.replace(/</g, '\\<').replace(/>/g, '\\>');
	}

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.html(div_2, () => marked.parse(sanitize(changelog)), true);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node = $.sibling($.child(div_4), 2);

	TableOfContents(node, { maxDepth: 2 });
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}