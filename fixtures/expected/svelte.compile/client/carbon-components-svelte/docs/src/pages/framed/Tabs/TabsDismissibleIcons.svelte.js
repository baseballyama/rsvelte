import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";
import Calendar from "carbon-icons-svelte/lib/Calendar.svelte";
import Dashboard from "carbon-icons-svelte/lib/Dashboard.svelte";
import Settings from "carbon-icons-svelte/lib/Settings.svelte";

export default function TabsDismissibleIcons($$anchor) {
	let selectedId = "dashboard";

	let tabs = [
		{ id: "dashboard", label: "Dashboard", icon: Dashboard },
		{ id: "schedule", label: "Schedule", icon: Calendar },
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
			disabled: true
		}
	];

	function handleDismiss({ detail }) {
		tabs = tabs.filter((tab) => tab.id !== detail.id);
	}

	Tabs($$anchor, {
		dismissible: true,
		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		},
		$$events: { dismiss: handleDismiss },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => tabs, (tab) => tab.id, ($$anchor, tab) => {
				Tab($$anchor, {
					get id() {
						return $.get(tab).id;
					},

					get label() {
						return $.get(tab).label;
					},

					get icon() {
						return $.get(tab).icon;
					},

					get disabled() {
						return $.get(tab).disabled;
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

				$.each(node_1, 17, () => tabs, (tab) => tab.id, ($$anchor, tab) => {
					TabContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(tab).label ?? ''} content`));
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