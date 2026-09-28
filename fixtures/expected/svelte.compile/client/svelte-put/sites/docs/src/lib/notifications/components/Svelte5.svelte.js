import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BaseNotification from './BaseNotification.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'item']);

var root = $.from_html(`<div class="space-y-2"><p>The <code>svelte-put</code> collection has moved to <a class="c-link" href="https://svelte.dev/docs/svelte/v5-migration-guide">Svelte 5</a>. I
			recommend you do too. If you are still using Svelte 4, head over to <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old documentation site</a>.</p> <button class="c-btn c-btn--outlined text-fg ml-auto">Don't show me again</button></div>`);

export default function Svelte5($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	function doNotShowAgain() {
		localStorage.setItem('skip-svelte-5-notification', 'true');
		$$props.item.resolve();
	}

	BaseNotification($$anchor, $.spread_props(
		{
			status: 'info',
			title: 'Are you runes-ed yet?',
			get item() {
				return $$props.item;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var div = root();
				var button = $.sibling($.child(div), 2);

				$.reset(div);
				$.delegated('click', button, doNotShowAgain);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}

$.delegate(['click']);