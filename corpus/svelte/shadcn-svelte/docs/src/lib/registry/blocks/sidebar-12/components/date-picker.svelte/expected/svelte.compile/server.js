import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

export default function Date_picker($$renderer) {
	if (Sidebar.Group) {
		$$renderer.push('<!--[-->');

		Sidebar.Group($$renderer, {
			class: 'px-0',
			children: ($$renderer) => {
				if (Sidebar.GroupContent) {
					$$renderer.push('<!--[-->');

					Sidebar.GroupContent($$renderer, {
						children: ($$renderer) => {
							Calendar($$renderer, {
								readonly: true,
								type: 'single',
								class: 'select-none [&_[data-bits-calendar-head-cell]]:w-[33px] [&_[role=gridcell]]:w-[33px] [&_[role=gridcell]_[role=button][data-today]]:bg-sidebar-primary [&_[role=gridcell]_[role=button][data-today]]:text-sidebar-primary-foreground'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}