import * as $ from 'svelte/internal/server';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";
import HeaderGlobalAction from "carbon-components-svelte/UIShell/HeaderGlobalAction.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

export default function HeaderGlobalAction_badge_test($$renderer) {
	$$renderer.push(`<div data-testid="no-badge">`);
	HeaderGlobalAction($$renderer, { iconDescription: 'Notifications', icon: Notification });
	$$renderer.push(`<!----></div> <div data-testid="dot">`);

	HeaderGlobalAction($$renderer, {
		iconDescription: 'Notifications',
		icon: Notification,
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: 0 });
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="count">`);

	HeaderGlobalAction($$renderer, {
		iconDescription: 'Notifications',
		icon: Notification,
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: 4 });
			}
		}
	});

	$$renderer.push(`<!----></div>`);
}