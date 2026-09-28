import * as $ from 'svelte/internal/server';
import { objectEntries } from "@antfu/utils";
import Preview from "@components/preview.svelte";
import { mergeAttrs } from "melt";
import { Popover } from "melt/builders";

export default function Popover_multiple_triggers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const popover = new Popover({ forceVisible: true, focus: { trap: true } });
		let activeTrigger = null;

		const triggerData = {
			user: {
				label: "User Profile",
				icon: "👤",
				content: {
					title: "User Settings",
					description: "Manage your account preferences and profile information.",
					actions: ["Edit Profile", "Change Password", "Privacy Settings"]
				}
			},
			notifications: {
				label: "Notifications",
				icon: "🔔",
				content: {
					title: "Notification Center",
					description: "You have 3 unread notifications and 2 pending updates.",
					actions: ["Mark All Read", "Settings", "Disable"]
				}
			},
			help: {
				label: "Help & Support",
				icon: "❓",
				content: {
					title: "Help Center",
					description: "Get assistance with common questions and troubleshooting.",
					actions: ["View FAQ", "Contact Support", "Report Bug"]
				}
			}
		};

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col items-center gap-6"><div class="flex gap-4"><!--[-->`);

				const each_array = $.ensure_array_like(objectEntries(triggerData));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [key, data] = each_array[$$index];

					$$renderer.push(`<button${$.attributes(
						{
							class: 'block rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800 transition-all hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
							...mergeAttrs(popover.trigger, { onclick: () => activeTrigger = key })
						},
						'svelte-1okmgpl'
					)}><span>${$.escape(data.icon)}</span> ${$.escape(data.label)}</button>`);
				}

				$$renderer.push(`<!--]--></div> <p class="text-sm text-gray-600 dark:text-gray-400">Click any button to see contextual content in the shared popover.</p></div> <div${$.attributes(
					{
						class: 'w-[280px] overflow-visible rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800',
						...popover.content
					},
					'svelte-1okmgpl'
				)}>`);

				if (activeTrigger && triggerData[activeTrigger]) {
					$$renderer.push('<!--[0-->');

					const data = triggerData[activeTrigger].content;

					$$renderer.push(`<div class="mb-3 flex items-center gap-2"><span class="text-xl">${$.escape(triggerData[activeTrigger].icon)}</span> <h3 class="text-lg font-semibold">${$.escape(data.title)}</h3></div> <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">${$.escape(data.description)}</p> <div class="flex flex-col gap-1"><!--[-->`);

					const each_array_1 = $.ensure_array_like(data.actions);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let action = each_array_1[$$index_1];

						$$renderer.push(`<button class="bg-transparent text-left text-sm underline transition-colors hover:opacity-75 active:opacity-50">${$.escape(action)}</button>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><p class="text-center text-gray-500 dark:text-gray-400">Click a trigger to see contextual content</p>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}