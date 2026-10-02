import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Input, Label } from "flowbite-svelte";
import { CardWidget } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<span>Current password</span> <!>`, 1);
var root_1 = $.from_html(`<span>New password</span> <!>`, 1);
var root_2 = $.from_html(`<span>Confirm password</span> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-6 gap-6"><!> <!> <!> <!></div>`);

export default function PasswordInfo($$anchor) {
	CardWidget($$anchor, {
		title: 'Password Information',
		class: 'max-w-none p-4 sm:p-6',
		children: ($$anchor, $$slotProps) => {
			var div = root_3();
			var node = $.child(div);

			Label(node, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.sibling($.first_child(fragment_1), 2);

					Input(node_1, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Label(node_2, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.sibling($.first_child(fragment_2), 2);

					Input(node_3, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Label(node_4, {
				class: 'col-span-6 space-y-2 sm:col-span-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_5 = $.sibling($.first_child(fragment_3), 2);

					Input(node_5, {
						placeholder: '••••••••',
						class: 'border font-normal outline-none'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Button(node_6, {
				class: 'sm:col-full col-span-6 w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Save all');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}