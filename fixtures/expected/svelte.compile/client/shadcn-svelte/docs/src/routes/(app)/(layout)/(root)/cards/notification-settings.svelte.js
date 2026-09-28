import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel
} from "$lib/registry/ui/field/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Notification_settings($$anchor) {
	let notifications = $.proxy([
		{
			id: "transactions",
			label: "Transaction alerts",
			description: "Deposits, withdrawals, and transfers.",
			checked: true
		},

		{
			id: "security",
			label: "Security alerts",
			description: "Login attempts and account changes.",
			checked: true
		},

		{
			id: "goals",
			label: "Goal milestones",
			description: "Updates at 25%, 50%, 75%, and 100%.",
			checked: false
		},

		{
			id: "market",
			label: "Market updates",
			description: "Daily portfolio summary and price alerts.",
			checked: false
		}
	]);

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Notifications');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Choose which email and push alerts you want to receive.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				children: ($$anchor, $$slotProps) => {
					FieldGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.each(node_4, 17, () => notifications, (n) => n.id, ($$anchor, n, $$index) => {
								Field($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_5 = $.first_child(fragment_6);

										Checkbox(node_5, {
											get id() {
												return `notify-${$.get(n).id ?? ''}`;
											},

											get checked() {
												return $.get(n).checked;
											},

											set checked($$value) {
												($.get(n).checked = $$value);
											}
										});

										var node_6 = $.sibling(node_5, 2);

										FieldContent(node_6, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_7 = $.first_child(fragment_7);

												FieldLabel(node_7, {
													get for() {
														return `notify-${$.get(n).id ?? ''}`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(n).label));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												var node_8 = $.sibling(node_7, 2);

												FieldDescription(node_8, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, $.get(n).description));
														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_3, 2);

			CardFooter(node_9, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Save Preferences');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}