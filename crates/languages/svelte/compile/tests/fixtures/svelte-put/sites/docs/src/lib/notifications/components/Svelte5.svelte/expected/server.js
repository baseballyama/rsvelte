import * as $ from 'svelte/internal/server';
import BaseNotification from './BaseNotification.svelte';

export default function Svelte5($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, $$slots, $$events, ...rest } = $$props;

		function doNotShowAgain() {
			localStorage.setItem('skip-svelte-5-notification', 'true');
			item.resolve();
		}

		BaseNotification($$renderer, $.spread_props([
			{ status: 'info', title: 'Are you runes-ed yet?', item },
			rest,
			{
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-2"><p>The <code>svelte-put</code> collection has moved to <a class="c-link" href="https://svelte.dev/docs/svelte/v5-migration-guide">Svelte 5</a>. I
			recommend you do too. If you are still using Svelte 4, head over to <a class="c-link" href="https://svelte-put-svelte-4.vnphanquang.com">the old documentation site</a>.</p> <button class="c-btn c-btn--outlined text-fg ml-auto">Don't show me again</button></div>`);
				},
				$$slots: { default: true }
			}
		]));
	});
}