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

import { Field, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid grid-cols-2 gap-3"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function New_milestone($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Set a new milestone');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Define your financial target and we\'ll help you pace your savings.');

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
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							Field(node_4, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_5 = $.first_child(fragment_5);

									FieldLabel(node_5, {
										for: 'goal-name',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Goal Name');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									Input(node_6, {
										id: 'goal-name',
										placeholder: 'e.g. New Car, Home Downpayment'
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var div = $.sibling(node_4, 2);
							var node_7 = $.child(div);

							Field(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_8 = $.first_child(fragment_6);

									FieldLabel(node_8, {
										for: 'target-amount',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Target Amount');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Input(node_9, { id: 'target-amount', value: '$15,000' });
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_7, 2);

							Field(node_10, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_11 = $.first_child(fragment_7);

									FieldLabel(node_11, {
										for: 'target-date',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Target Date');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									Input(node_12, { id: 'target-date', value: 'Dec 2025' });
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_3, 2);

			CardFooter(node_13, {
				class: 'flex-col gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_14 = $.first_child(fragment_8);

					Button(node_14, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Create Goal');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Button(node_15, {
						variant: 'outline',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Cancel');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}