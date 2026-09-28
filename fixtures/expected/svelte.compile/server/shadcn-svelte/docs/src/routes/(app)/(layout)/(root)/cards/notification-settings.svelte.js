import * as $ from 'svelte/internal/server';
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

export default function Notification_settings($$renderer) {
	let notifications = [
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
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Card($$renderer, {
			children: ($$renderer) => {
				CardHeader($$renderer, {
					children: ($$renderer) => {
						CardTitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Notifications`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardDescription($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Choose which email and push alerts you want to receive.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardContent($$renderer, {
					children: ($$renderer) => {
						FieldGroup($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(notifications);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let n = each_array[$$index];

									Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											Checkbox($$renderer, {
												id: `notify-${$.stringify(n.id)}`,
												get checked() {
													return n.checked;
												},

												set checked($$value) {
													n.checked = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											FieldContent($$renderer, {
												children: ($$renderer) => {
													FieldLabel($$renderer, {
														for: `notify-${$.stringify(n.id)}`,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(n.label)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													FieldDescription($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(n.description)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CardFooter($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							class: 'w-full',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Save Preferences`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}