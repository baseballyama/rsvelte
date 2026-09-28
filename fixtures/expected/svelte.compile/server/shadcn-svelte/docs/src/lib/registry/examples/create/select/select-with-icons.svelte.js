import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

function chartLineIcon($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'ChartLineIcon',
		tabler: 'IconChartLine',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartLineIcon',
		remixicon: 'RiLineChartLine'
	});
}

function chartBarIcon($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'ChartBarIcon',
		tabler: 'IconChartBar',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartBarIcon',
		remixicon: 'RiBarChartLine'
	});
}

function chartPieIcon($$renderer) {
	IconPlaceholder($$renderer, {
		lucide: 'ChartPieIcon',
		tabler: 'IconChartPie',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartPieIcon',
		remixicon: 'RiPieChartLine'
	});
}

export default function Select_with_icons($$renderer) {
	const items = $.derived(() => [
		{ label: "Line", value: "line", icon: chartLineIcon },
		{ label: "Bar", value: "bar", icon: chartBarIcon },
		{ label: "Pie", value: "pie", icon: chartPieIcon }
	]);

	let selectedValueSm = undefined;
	let selectedValueDefault = undefined;
	const selectedItemSm = $.derived(() => items().find((item) => item.value === selectedValueSm));
	const selectedItemDefault = $.derived(() => items().find((item) => item.value === selectedValueDefault));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Icons',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-4">`);

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						get value() {
							return selectedValueSm;
						},

						set value($$value) {
							selectedValueSm = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									size: 'sm',
									children: ($$renderer) => {
										if (selectedItemSm()) {
											$$renderer.push('<!--[0-->');
											selectedItemSm().icon($$renderer);
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> ${$.escape(selectedItemSm()?.label ?? "Chart Type")}`);
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
									children: ($$renderer) => {
										if (Select.Group) {
											$$renderer.push('<!--[-->');

											Select.Group($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(items());

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let item = each_array[$$index];

														if (Select.Item) {
															$$renderer.push('<!--[-->');

															Select.Item($$renderer, {
																value: item.value,
																children: ($$renderer) => {
																	item.icon($$renderer);
																	$$renderer.push(`<!----> ${$.escape(item.label)}`);
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

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						get value() {
							return selectedValueDefault;
						},

						set value($$value) {
							selectedValueDefault = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									size: 'default',
									children: ($$renderer) => {
										if (selectedItemDefault()) {
											$$renderer.push('<!--[0-->');
											selectedItemDefault().icon($$renderer);
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> ${$.escape(selectedItemDefault()?.label ?? "Chart Type")}`);
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
									children: ($$renderer) => {
										if (Select.Group) {
											$$renderer.push('<!--[-->');

											Select.Group($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_1 = $.ensure_array_like(items());

													for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
														let item = each_array_1[$$index_1];

														if (Select.Item) {
															$$renderer.push('<!--[-->');

															Select.Item($$renderer, {
																value: item.value,
																children: ($$renderer) => {
																	item.icon($$renderer);
																	$$renderer.push(`<!----> ${$.escape(item.label)}`);
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

				$$renderer.push(`</div>`);
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