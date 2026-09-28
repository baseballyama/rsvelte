import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

export default function Date_picker($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			class: 'px-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								readonly: true,
								type: 'single',
								class: 'select-none [&_[data-bits-calendar-head-cell]]:w-[33px] [&_[role=gridcell]]:w-[33px] [&_[role=gridcell]_[role=button][data-today]]:bg-sidebar-primary [&_[role=gridcell]_[role=button][data-today]]:text-sidebar-primary-foreground'
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}