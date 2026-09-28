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

import { Field, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function New_milestone($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set a new milestone`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Define your financial target and we'll help you pace your savings.`);
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
							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'goal-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Goal Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'goal-name',
										placeholder: 'e.g. New Car, Home Downpayment'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-3">`);

							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'target-amount',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Target Amount`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									Input($$renderer, { id: 'target-amount', value: '$15,000' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'target-date',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Target Date`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									Input($$renderer, { id: 'target-date', value: 'Dec 2025' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col gap-2',
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Create Goal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Cancel`);
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