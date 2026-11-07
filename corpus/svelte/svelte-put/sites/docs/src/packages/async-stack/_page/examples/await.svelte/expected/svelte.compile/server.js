import * as $ from 'svelte/internal/server';
import { notiStack } from './comprehensive/notification-stack';

export default function Await($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::focus
		// :::highlight
		let promise = null;

		// :::
		// :::
		async function pushNoti() {
			// :::focus
			// :::highlight
			const pushed = notiStack.push('info', {
				// :::
				// :::
				timeout: 0,
				props: { content: 'persistent' }
			});

			// :::focus
			// :::highlight
			promise = pushed.resolution;

			await promise;

			// :::
			// :::
			setTimeout(() => promise = null, 2000);
		}

		function popNoti() {
			// :::focus
			// :::highlight
			notiStack.pop();

			// :::
			// :::
		}

		$$renderer.push(`<button${$.attr('disabled', !!promise, true)}${$.attr_class('c-btn', void 0, { 'bg-gray-500': !!promise })}>Push a persistent notification</button> `);

		if (promise) {
			$$renderer.push(`<!--[0--><p class="mt-2 text-blue-500">`);

			$.await(
				$$renderer,
				promise,
				() => {
					$$renderer.push(`Notification is pushed and waiting for resolution. Either click the x button on the
			notification, or <button class="c-link">click here</button> to pop the notification.`);
				},
				() => {
					$$renderer.push(`Resolved (resetting in 2 seconds)`);
				}
			);

			$$renderer.push(`<!--]--></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}