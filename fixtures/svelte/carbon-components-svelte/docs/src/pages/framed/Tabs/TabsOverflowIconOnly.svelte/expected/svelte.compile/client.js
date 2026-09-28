import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";
import Activity from "carbon-icons-svelte/lib/Activity.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";
import Analytics from "carbon-icons-svelte/lib/Analytics.svelte";
import Calendar from "carbon-icons-svelte/lib/Calendar.svelte";
import Chat from "carbon-icons-svelte/lib/Chat.svelte";
import Dashboard from "carbon-icons-svelte/lib/Dashboard.svelte";
import Document from "carbon-icons-svelte/lib/Document.svelte";
import Email from "carbon-icons-svelte/lib/Email.svelte";
import Folder from "carbon-icons-svelte/lib/Folder.svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";
import Search from "carbon-icons-svelte/lib/Search.svelte";

export default function TabsOverflowIconOnly($$anchor) {
	const items = [
		{ label: "Dashboard", icon: Dashboard },
		{ label: "Activity", icon: Activity },
		{ label: "Analytics", icon: Analytics },
		{ label: "Calendar", icon: Calendar },
		{ label: "Chat", icon: Chat },
		{ label: "Documents", icon: Document },
		{ label: "Email", icon: Email },
		{ label: "Files", icon: Folder },
		{ label: "Information", icon: Information },
		{ label: "Notifications", icon: Notification },
		{ label: "Search", icon: Search },
		{ label: "Add", icon: Add }
	];

	Tabs($$anchor, {
		iconOnly: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, $.index, ($$anchor, item) => {
				Tab($$anchor, {
					get label() {
						return $.get(item).label;
					},

					get icon() {
						return $.get(item).icon;
					}
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_1 = $.first_child(fragment_3);

				$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
					TabContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(item).label ?? ''} content`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			}
		}
	});
}