import * as $ from 'svelte/internal/server';
import { notiStack } from '../comprehensive/notification-stack';
import InteractiveNotification from './InteractiveNotification.svelte';

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::highlight
		// :::
		let state = 'idle';

		async function pushNoti() {
			const pushed = notiStack.push('custom', {
				timeout: 0,
				// :::highlight
				component: InteractiveNotification,

				// :::
				props: { message: 'You are invited to join the Svelte community!' }
			});

			state = 'pending';

			// :::highlight
			const agreed = await pushed.resolution;

			// :::
			state = agreed ? 'accepted' : 'denied';
		}

		$$renderer.push(`<p>`);

		if (state === 'idle') {
			$$renderer.push(`<!--[0-->Waiting for notification to be pushed`);
		} else if (state === 'pending') {
			$$renderer.push(`<!--[1-->Waiting for user action to resolve notification`);
		} else {
			$$renderer.push(`<!--[-1-->Invitation was <span${$.attr_class('px-2', void 0, {
				'hl-error': state == 'denied',
				'hl-success': state === 'accepted'
			})}>${$.escape(state)}</span>`);
		}

		$$renderer.push(`<!--]--></p> <button class="c-btn"${$.attr('disabled', state === 'pending', true)}>Trigger Interactive Notification</button>`);
	});
}