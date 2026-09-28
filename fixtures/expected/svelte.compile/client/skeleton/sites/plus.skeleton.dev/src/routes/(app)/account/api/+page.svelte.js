import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PageHeader from '$lib/components/layout/page-header.svelte';

import {
	CopyIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	PlusIcon,
	RefreshCwIcon
} from '@lucide/svelte';

var root = $.from_html(`<tr><td class="font-bold"> </td><td><div class="flex items-center gap-2"><code class="code"> </code></div></td><td> </td><td> </td><td class="flex justify-end items-center gap-2"><button type="button" class="btn-icon hover:preset-tonal" aria-label="Copy key"><!></button> <button type="button" class="btn-icon hover:preset-tonal" aria-label="Key actions"><!></button></td></tr>`);

var root_1 = $.from_html(`<div><!> <div class="container-page space-y-4"><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">REST API</h2> <p class="opacity-60">Authenticate requests with a Bearer token using one of your API keys.</p></header> <div class="space-y-2"><p class="text-xs font-bold opacity-60">Base URL</p> <pre class="pre">https://api.skeleton.dev/v1</pre></div> <div class="space-y-2"><p class="text-xs font-bold opacity-60">Example request</p> <pre class="pre">curl https://api.skeleton.dev/v1/themes \\
  -H "Authorization: Bearer $SKELETON_API_KEY"</pre></div></section> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">Skeleton CLI</h2> <p class="opacity-60">Install and manage premium themes from the command line.</p></header> <div class="space-y-2"><p class="text-xs font-bold opacity-60">Install</p> <pre class="pre">pnpm add -D @skeletonlabs/cli</pre></div> <div class="space-y-2"><p class="text-xs font-bold opacity-60">Authenticate</p> <pre class="pre">pnpm skeleton login</pre></div> <div class="space-y-2"><p class="text-xs font-bold opacity-60">Add a theme</p> <pre class="pre">pnpm skeleton --add-theme=cerberus</pre></div></section></div> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="flex justify-between items-center gap-4"><div class="space-y-1"><h2 class="h3">API Keys</h2> <p class="opacity-60">Keys are shown only once at creation. Rotate any key you suspect has been exposed.</p></div> <button type="button" class="btn preset-outlined-surface-200-800"><!> <span>Key</span></button></header> <div class="table-wrap"><table class="table caption-bottom"><thead><tr><th>Name</th><th>Key</th><th>Created</th><th>Last used</th><th class="text-right!"></th></tr></thead><tbody></tbody></table></div></section></div></div>`);

export default function _page($$anchor) {
	const apiKeys = [
		{
			name: 'Production',
			prefix: 'sk_live_4f7a',
			created: 'Apr 02, 2026',
			lastUsed: 'May 12, 2026'
		},

		{
			name: 'Staging',
			prefix: 'sk_test_9c2b',
			created: 'Mar 18, 2026',
			lastUsed: 'May 10, 2026'
		},

		{
			name: 'Local',
			prefix: 'sk_test_1e8d',
			created: 'Feb 27, 2026',
			lastUsed: 'Apr 21, 2026'
		}
	];

	const premiumThemes = [
		{
			name: 'cerberus',
			summary: 'Crimson and slate, official Skeleton flagship.'
		},

		{
			name: 'mona',
			summary: 'Soft pastels with a warm neutral base.'
		},

		{
			name: 'vox',
			summary: 'High-contrast electric blue, designed for dashboards.'
		},

		{
			name: 'pine',
			summary: 'Earth-tone palette inspired by Pacific Northwest forests.'
		}
	];

	const recentActivity = [
		{
			endpoint: 'GET /v1/themes',
			status: 200,
			source: 'CLI',
			date: 'May 12, 2026 · 9:42 AM'
		},

		{
			endpoint: 'POST /v1/themes/cerberus/install',
			status: 200,
			source: 'CLI',
			date: 'May 12, 2026 · 9:41 AM'
		},

		{
			endpoint: 'GET /v1/account',
			status: 200,
			source: 'API',
			date: 'May 11, 2026 · 6:18 PM'
		},

		{
			endpoint: 'GET /v1/themes/mona',
			status: 404,
			source: 'API',
			date: 'May 09, 2026 · 11:05 AM'
		}
	];

	var div = root_1();
	var node = $.child(div);

	PageHeader(node, { title: 'API & CLI' });

	var div_1 = $.sibling(node, 2);
	var section = $.sibling($.child(div_1), 2);
	var header = $.child(section);
	var button = $.sibling($.child(header), 2);
	var node_1 = $.child(button);

	PlusIcon(node_1, {});
	$.next(2);
	$.reset(button);
	$.reset(header);

	var div_2 = $.sibling(header, 2);
	var table = $.child(div_2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => apiKeys, ({ name, prefix, created, lastUsed }) => prefix, ($$anchor, $$item) => {
		let name = () => $.get($$item).name;
		let prefix = () => $.get($$item).prefix;
		let created = () => $.get($$item).created;
		let lastUsed = () => $.get($$item).lastUsed;
		var tr = root();
		var td = $.child(tr);
		var text = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var div_3 = $.child(td_1);
		var code = $.child(div_3);
		var text_1 = $.only_child(code);

		$.reset(div_3);
		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_2 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var button_1 = $.child(td_4);
		var node_2 = $.child(button_1);

		CopyIcon(node_2, { class: 'size-elem-sm' });
		$.reset(button_1);

		var button_2 = $.sibling(button_1, 2);
		var node_3 = $.child(button_2);

		EllipsisVerticalIcon(node_3, {});
		$.reset(button_2);
		$.reset(td_4);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text, name());
			$.set_text(text_1, `${prefix() ?? ''}••••••••••••`);
			$.set_text(text_2, created());
			$.set_text(text_3, lastUsed());
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_2);
	$.reset(section);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}