import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Switch, Tooltip } from "$lib/index.js";

import {
	switchDefault,
	switchDisabled,
	switchFullWidth,
	switchIcon,
	switchSize,
	switchTooltip
} from "../../docs/data/switch.js";

import { GridSquare, ListUnordered } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const error = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "status dot", href: "/status-dot" },
				next: { title: "table", href: "/table" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Switch</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Choose between a set of options.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Ensure the width of each item is wide enough to prevent jumping when active.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultSwitch = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/switch#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_2, 4);

				{
					const demo = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => Switch.Root, ($$anchor, Switch_Root) => {
							Switch_Root($$anchor, {
								name: 'default',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Switch.Control, ($$anchor, Switch_Control) => {
										Switch_Control($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Switch.Control, ($$anchor, Switch_Control_1) => {
										Switch_Control_1($$anchor, { label: 'Output', value: 'output' });
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					var node_6 = $.child(div_4);

					demoAndCode(node_6, () => demo, () => switchDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const disabled = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_4();
				var node_7 = $.first_child(fragment_7);

				LinkH2(node_7, {
					href: '/switch#disabled',
					'aria-label': 'disabled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('disabled');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_7, 2);

				{
					const demo = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						$.component(node_8, () => Switch.Root, ($$anchor, Switch_Root_1) => {
							Switch_Root_1($$anchor, {
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_2();
									var node_9 = $.first_child(fragment_9);

									$.component(node_9, () => Switch.Control, ($$anchor, Switch_Control_2) => {
										Switch_Control_2($$anchor, {
											defaultChecked: true,
											disabled: true,
											label: 'Source',
											value: 'source'
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Switch.Control, ($$anchor, Switch_Control_3) => {
										Switch_Control_3($$anchor, { label: 'Output', disabled: true, value: 'output' });
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					};

					var node_11 = $.child(div_5);

					demoAndCode(node_11, () => demo, () => switchDisabled);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	};

	const sizes = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_11 = root_4();
				var node_12 = $.first_child(fragment_11);

				LinkH2(node_12, {
					href: '/switch#sizes',
					'aria-label': 'sizes',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('sizes');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var div_6 = $.sibling(node_12, 2);

				{
					const demo = ($$anchor) => {
						var fragment_12 = root_5();
						var node_13 = $.first_child(fragment_12);

						$.component(node_13, () => Switch.Root, ($$anchor, Switch_Root_2) => {
							Switch_Root_2($$anchor, {
								name: 'size-small',
								size: 'small',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_2();
									var node_14 = $.first_child(fragment_13);

									$.component(node_14, () => Switch.Control, ($$anchor, Switch_Control_4) => {
										Switch_Control_4($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Switch.Control, ($$anchor, Switch_Control_5) => {
										Switch_Control_5($$anchor, { label: 'Output', value: 'output' });
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_13, 2);

						$.component(node_16, () => Switch.Root, ($$anchor, Switch_Root_3) => {
							Switch_Root_3($$anchor, {
								name: 'size-default',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_2();
									var node_17 = $.first_child(fragment_14);

									$.component(node_17, () => Switch.Control, ($$anchor, Switch_Control_6) => {
										Switch_Control_6($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Switch.Control, ($$anchor, Switch_Control_7) => {
										Switch_Control_7($$anchor, { label: 'Output', value: 'output' });
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_16, 2);

						$.component(node_19, () => Switch.Root, ($$anchor, Switch_Root_4) => {
							Switch_Root_4($$anchor, {
								name: 'size-large',
								size: 'large',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_2();
									var node_20 = $.first_child(fragment_15);

									$.component(node_20, () => Switch.Control, ($$anchor, Switch_Control_8) => {
										Switch_Control_8($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Switch.Control, ($$anchor, Switch_Control_9) => {
										Switch_Control_9($$anchor, { label: 'Output', value: 'output' });
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_12);
					};

					var node_22 = $.child(div_6);

					demoAndCode(node_22, () => demo, () => switchSize);
					$.reset(div_6);
				}

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	};

	const fullWidth = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_17 = root_4();
				var node_23 = $.first_child(fragment_17);

				LinkH2(node_23, {
					href: '/switch#full-width',
					'aria-label': 'full-width',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('full width');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var div_7 = $.sibling(node_23, 2);

				{
					const demo = ($$anchor) => {
						var fragment_18 = $.comment();
						var node_24 = $.first_child(fragment_18);

						$.component(node_24, () => Switch.Root, ($$anchor, Switch_Root_5) => {
							Switch_Root_5($$anchor, {
								name: 'size-small',
								size: 'large',
								fullWidth: true,
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_2();
									var node_25 = $.first_child(fragment_19);

									$.component(node_25, () => Switch.Control, ($$anchor, Switch_Control_10) => {
										Switch_Control_10($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
									});

									var node_26 = $.sibling(node_25, 2);

									$.component(node_26, () => Switch.Control, ($$anchor, Switch_Control_11) => {
										Switch_Control_11($$anchor, { label: 'Output', value: 'output' });
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_18);
					};

					var node_27 = $.child(div_7);

					demoAndCode(node_27, () => demo, () => switchFullWidth);
					$.reset(div_7);
				}

				$.append($$anchor, fragment_17);
			},
			$$slots: { default: true }
		});
	};

	const tooltip = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_21 = root_4();
				var node_28 = $.first_child(fragment_21);

				LinkH2(node_28, {
					href: '/switch#tooltip',
					'aria-label': 'tooltip',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('tooltip');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var div_8 = $.sibling(node_28, 2);

				{
					const demo = ($$anchor) => {
						var fragment_22 = $.comment();
						var node_29 = $.first_child(fragment_22);

						$.component(node_29, () => Switch.Root, ($$anchor, Switch_Root_6) => {
							Switch_Root_6($$anchor, {
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_23 = root_2();
									var node_30 = $.first_child(fragment_23);

									Tooltip(node_30, {
										text: 'View Source',
										children: ($$anchor, $$slotProps) => {
											var fragment_24 = $.comment();
											var node_31 = $.first_child(fragment_24);

											$.component(node_31, () => Switch.Control, ($$anchor, Switch_Control_12) => {
												Switch_Control_12($$anchor, { defaultChecked: true, label: 'Source', value: 'source' });
											});

											$.append($$anchor, fragment_24);
										},
										$$slots: { default: true }
									});

									var node_32 = $.sibling(node_30, 2);

									Tooltip(node_32, {
										text: 'View Output',
										children: ($$anchor, $$slotProps) => {
											var fragment_25 = $.comment();
											var node_33 = $.first_child(fragment_25);

											$.component(node_33, () => Switch.Control, ($$anchor, Switch_Control_13) => {
												Switch_Control_13($$anchor, { label: 'Output', value: 'output' });
											});

											$.append($$anchor, fragment_25);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_23);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_22);
					};

					var node_34 = $.child(div_8);

					demoAndCode(node_34, () => demo, () => switchTooltip);
					$.reset(div_8);
				}

				$.append($$anchor, fragment_21);
			},
			$$slots: { default: true }
		});
	};

	const icon = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_27 = root_4();
				var node_35 = $.first_child(fragment_27);

				LinkH2(node_35, {
					href: '/switch#icon',
					'aria-label': 'icon',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('icon');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var div_9 = $.sibling(node_35, 2);

				{
					const demo = ($$anchor) => {
						var fragment_28 = root_5();
						var node_36 = $.first_child(fragment_28);

						$.component(node_36, () => Switch.Root, ($$anchor, Switch_Root_7) => {
							Switch_Root_7($$anchor, {
								name: 'size-small',
								size: 'small',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_29 = root_2();
									var node_37 = $.first_child(fragment_29);

									$.component(node_37, () => Switch.Control, ($$anchor, Switch_Control_14) => {
										Switch_Control_14($$anchor, {
											defaultChecked: true,
											get icon() {
												return GridSquare;
											},
											value: 'source'
										});
									});

									var node_38 = $.sibling(node_37, 2);

									$.component(node_38, () => Switch.Control, ($$anchor, Switch_Control_15) => {
										Switch_Control_15($$anchor, {
											get icon() {
												return ListUnordered;
											},
											value: 'output'
										});
									});

									$.append($$anchor, fragment_29);
								},
								$$slots: { default: true }
							});
						});

						var node_39 = $.sibling(node_36, 2);

						$.component(node_39, () => Switch.Root, ($$anchor, Switch_Root_8) => {
							Switch_Root_8($$anchor, {
								name: 'size-default',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_30 = root_2();
									var node_40 = $.first_child(fragment_30);

									$.component(node_40, () => Switch.Control, ($$anchor, Switch_Control_16) => {
										Switch_Control_16($$anchor, {
											defaultChecked: true,
											get icon() {
												return GridSquare;
											},
											value: 'source'
										});
									});

									var node_41 = $.sibling(node_40, 2);

									$.component(node_41, () => Switch.Control, ($$anchor, Switch_Control_17) => {
										Switch_Control_17($$anchor, {
											get icon() {
												return ListUnordered;
											},
											value: 'output'
										});
									});

									$.append($$anchor, fragment_30);
								},
								$$slots: { default: true }
							});
						});

						var node_42 = $.sibling(node_39, 2);

						$.component(node_42, () => Switch.Root, ($$anchor, Switch_Root_9) => {
							Switch_Root_9($$anchor, {
								name: 'size-large',
								size: 'large',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_31 = root_2();
									var node_43 = $.first_child(fragment_31);

									$.component(node_43, () => Switch.Control, ($$anchor, Switch_Control_18) => {
										Switch_Control_18($$anchor, {
											defaultChecked: true,
											get icon() {
												return GridSquare;
											},
											value: 'source'
										});
									});

									var node_44 = $.sibling(node_43, 2);

									$.component(node_44, () => Switch.Control, ($$anchor, Switch_Control_19) => {
										Switch_Control_19($$anchor, {
											get icon() {
												return ListUnordered;
											},
											value: 'output'
										});
									});

									$.append($$anchor, fragment_31);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_28);
					};

					var node_45 = $.child(div_9);

					demoAndCode(node_45, () => demo, () => switchIcon);
					$.reset(div_9);
				}

				$.append($$anchor, fragment_27);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_34 = root_6();
		var node_46 = $.first_child(fragment_34);

		error(node_46);

		var node_47 = $.sibling(node_46, 2);

		defaultSwitch(node_47);

		var node_48 = $.sibling(node_47, 2);

		disabled(node_48);

		var node_49 = $.sibling(node_48, 2);

		sizes(node_49);

		var node_50 = $.sibling(node_49, 2);

		fullWidth(node_50);

		var node_51 = $.sibling(node_50, 2);

		tooltip(node_51);

		var node_52 = $.sibling(node_51, 2);

		icon(node_52);

		var node_53 = $.sibling(node_52, 2);

		prevAndNext(node_53);
		$.append($$anchor, fragment_34);
	};

	let value = $.state("");

	$.head('j2e911', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Switch';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}