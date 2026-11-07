import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";
import HeaderGlobalAction from "carbon-components-svelte/UIShell/HeaderGlobalAction.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

var root = $.from_html(`<div data-testid="no-badge"><!></div> <div data-testid="dot"><!></div> <div data-testid="count"><!></div>`, 1);

export default function HeaderGlobalAction_badge_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	HeaderGlobalAction(node, {
		iconDescription: 'Notifications',
		get icon() {
			return Notification;
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	HeaderGlobalAction(node_1, {
		iconDescription: 'Notifications',
		get icon() {
			return Notification;
		},

		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: 0 });
			}
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	HeaderGlobalAction(node_2, {
		iconDescription: 'Notifications',
		get icon() {
			return Notification;
		},

		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: 4 });
			}
		}
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
}