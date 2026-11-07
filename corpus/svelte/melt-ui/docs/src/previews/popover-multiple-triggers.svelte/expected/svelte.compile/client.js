import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { objectEntries } from "@antfu/utils";
import Preview from "@components/preview.svelte";
import { mergeAttrs } from "melt";
import { Popover } from "melt/builders";

var root = $.from_html(`<button><span> </span> </button>`);
var root_1 = $.from_html(`<button class="bg-transparent text-left text-sm underline transition-colors hover:opacity-75 active:opacity-50"> </button>`);
var root_2 = $.from_html(`<div class="mb-3 flex items-center gap-2"><span class="text-xl"> </span> <h3 class="text-lg font-semibold"> </h3></div> <p class="mb-4 text-sm text-gray-600 dark:text-gray-400"> </p> <div class="flex flex-col gap-1"></div>`, 1);
var root_3 = $.from_html(`<p class="text-center text-gray-500 dark:text-gray-400">Click a trigger to see contextual content</p>`);
var root_4 = $.from_html(`<div class="flex flex-col items-center gap-6"><div class="flex gap-4"></div> <p class="text-sm text-gray-600 dark:text-gray-400">Click any button to see contextual content in the shared popover.</p></div> <div><!></div>`, 1);

export default function Popover_multiple_triggers($$anchor, $$props) {
	$.push($$props, true);

	const popover = new Popover({ forceVisible: true, focus: { trap: true } });
	let activeTrigger = $.state(null);

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

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);

			$.each(div_1, 21, () => objectEntries(triggerData), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let data = () => $.get($$array)[1];
				var button = root();

				$.attribute_effect(
					button,
					($0) => ({
						class: 'block rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800\n				transition-all hover:cursor-pointer hover:bg-gray-200\n				active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n				dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
						...$0
					}),
					[
						() => mergeAttrs(popover.trigger, { onclick: () => $.set(activeTrigger, key(), true) })
					],
					void 0,
					void 0,
					'svelte-1okmgpl'
				);

				var span = $.child(button);
				var text = $.only_child(span, true);
				var text_1 = $.sibling(span);

				$.reset(button);

				$.template_effect(() => {
					$.set_text(text, data().icon);
					$.set_text(text_1, ` ${data().label ?? ''}`);
				});

				$.append($$anchor, button);
			});

			$.reset(div_1);
			$.next(2);
			$.reset(div);

			var div_2 = $.sibling(div, 2);

			$.attribute_effect(
				div_2,
				() => ({
					class: 'w-[280px] overflow-visible rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800',
					...popover.content
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1okmgpl'
			);

			var node = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					const data = $.derived(() => triggerData[$.get(activeTrigger)].content);
					var fragment_2 = root_2();
					var div_3 = $.first_child(fragment_2);
					var span_1 = $.child(div_3);
					var text_2 = $.only_child(span_1, true);
					var h3 = $.sibling(span_1, 2);
					var text_3 = $.only_child(h3, true);

					$.reset(div_3);

					var p = $.sibling(div_3, 2);
					var text_4 = $.only_child(p, true);
					var div_4 = $.sibling(p, 2);

					$.each(div_4, 21, () => $.get(data).actions, $.index, ($$anchor, action) => {
						var button_1 = root_1();
						var text_5 = $.only_child(button_1, true);

						$.template_effect(() => $.set_text(text_5, $.get(action)));
						$.append($$anchor, button_1);
					});

					$.reset(div_4);

					$.template_effect(() => {
						$.set_text(text_2, triggerData[$.get(activeTrigger)].icon);
						$.set_text(text_3, $.get(data).title);
						$.set_text(text_4, $.get(data).description);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var p_1 = root_3();

					$.append($$anchor, p_1);
				};

				$.if(node, ($$render) => {
					if ($.get(activeTrigger) && triggerData[$.get(activeTrigger)]) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}