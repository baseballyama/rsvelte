import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_select_and_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const durationItems = [
			{ label: "Hours", value: "hours" },
			{ label: "Days", value: "days" },
			{ label: "Weeks", value: "weeks" }
		];

		let duration = durationItems[0].value;
		const durationLabel = $.derived(() => durationItems.find((item) => item.value === duration)?.label ?? "Hours");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Select and Input',
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							if (Select.Root) {
								$$renderer.push('<!--[-->');

								Select.Root($$renderer, {
									type: 'single',
									get value() {
										return duration;
									},

									set value($$value) {
										duration = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Select.Trigger) {
											$$renderer.push('<!--[-->');

											Select.Trigger($$renderer, {
												id: 'duration',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(durationLabel())}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Content) {
											$$renderer.push('<!--[-->');

											Select.Content($$renderer, {
												align: 'start',
												children: ($$renderer) => {
													if (Select.Group) {
														$$renderer.push('<!--[-->');

														Select.Group($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(durationItems);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let item = each_array[$$index];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: item.value,
																			label: item.label,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(item.label)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}

																$$renderer.push(`<!--]-->`);
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
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);
							Input($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
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
	});
}