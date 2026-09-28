import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Toggle } from "$lib/index.js";

import {
	toggleCustomColors,
	toggleDefault,
	toggleSizes,
	toggleWithLabel
} from "../../docs/data/toggle.js";

import { LockClosedSmall, LockOpenSmall } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const toggle = ($$anchor) => {
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

const sizes = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_6 = $.first_child(fragment_5);

			LinkH2(node_6, {
				href: '/toggle#sizes',
				'aria-label': 'sizes',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('sizes');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_6, 2);

			{
				const demo = ($$anchor) => {
					var div_9 = root_4();
					var div_10 = $.child(div_9);
					var node_7 = $.child(div_10);

					Toggle(node_7, { 'aria-label': 'Enable Firewall', checked: false });
					$.reset(div_10);

					var div_11 = $.sibling(div_10, 2);
					var node_8 = $.child(div_11);

					Toggle(node_8, {
						'aria-label': 'Enable Firewall',
						checked: false,
						size: 'large'
					});

					$.reset(div_11);
					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var node_9 = $.child(div_8);

				demoAndCode(node_9, () => demo, () => toggleSizes);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "theme switcher", href: "/theme-switcher" },
				next: { title: "tooltip", href: "/tooltip" }
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

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Toggle</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Displays a boolean value.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<div class="space-y-4"><div class="w-full"><!></div> <div class="w-full"><!></div></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="flex w-full"><div class="w-4/12"><!></div> <div class="w-4/12"><!></div></div>`);
var root_5 = $.from_html(`<div class="w-full space-y-4"><div class="w-full"><!></div> <div class="w-full"><!></div> <div class="w-full"><!></div> <div class="w-full"><!></div> <div class="w-full"><!></div> <div class="w-full"><!></div></div>`);
var root_6 = $.from_html(`<div class="w-full space-y-6"><div class="flex w-full items-center gap-4"><!> <!></div> <div class="flex w-full items-center gap-4"><!> <!></div> <div class="flex w-full items-center gap-4"><!> <!></div> <div class="flex w-full items-center gap-4"><!> <!></div></div>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultToggle = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/toggle#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var div_5 = root_2();
						var div_6 = $.child(div_5);
						var node_3 = $.child(div_6);

						Toggle(node_3, { 'aria-label': 'Enable Firewall', checked });
						$.reset(div_6);

						var div_7 = $.sibling(div_6, 2);
						var node_4 = $.child(div_7);

						Toggle(node_4, { 'aria-label': 'Enable Firewall', checked: checked2 });
						$.reset(div_7);
						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					var node_5 = $.child(div_4);

					demoAndCode(node_5, () => demo, () => toggleDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const customColors = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_3();
				var node_10 = $.first_child(fragment_7);

				LinkH2(node_10, {
					href: '/toggle#custom-color',
					'aria-label': 'custom color',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('custom color');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var div_12 = $.sibling(node_10, 2);

				{
					const demo = ($$anchor) => {
						var div_13 = root_5();
						var div_14 = $.child(div_13);
						var node_11 = $.child(div_14);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_11, {
								'aria-label': 'Enable Firewall',
								color: 'purple',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_14);

						var div_15 = $.sibling(div_14, 2);
						var node_12 = $.child(div_15);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_12, {
								'aria-label': 'Enable Firewall',
								color: 'amber',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_15);

						var div_16 = $.sibling(div_15, 2);
						var node_13 = $.child(div_16);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_13, {
								'aria-label': 'Enable Firewall',
								color: 'red',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_16);

						var div_17 = $.sibling(div_16, 2);
						var node_14 = $.child(div_17);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_14, {
								'aria-label': 'Enable Firewall',
								color: 'pink',
								size: 'large',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_17);

						var div_18 = $.sibling(div_17, 2);
						var node_15 = $.child(div_18);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_15, {
								'aria-label': 'Enable Firewall',
								color: 'green',
								size: 'large',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_18);

						var div_19 = $.sibling(div_18, 2);
						var node_16 = $.child(div_19);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_16, {
								'aria-label': 'Enable Firewall',
								color: 'teal',
								size: 'large',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(checkedCustom);
								},

								set checked($$value) {
									$.set(checkedCustom, $$value, true);
								}
							});
						}

						$.reset(div_19);
						$.reset(div_13);
						$.append($$anchor, div_13);
					};

					var node_17 = $.child(div_12);

					demoAndCode(node_17, () => demo, () => toggleCustomColors);
					$.reset(div_12);
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	};

	const withLabel = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_3();
				var node_18 = $.first_child(fragment_9);

				LinkH2(node_18, {
					href: '/toggle#with-label',
					'aria-label': 'with label',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('with label');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var div_20 = $.sibling(node_18, 2);

				{
					const demo = ($$anchor) => {
						var div_21 = root_6();
						var div_22 = $.child(div_21);
						var node_19 = $.child(div_22);

						Toggle(node_19, {
							'aria-label': 'Enable Firewall',
							get checked() {
								return $.get(label);
							},

							set checked($$value) {
								$.set(label, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Enable Firewall');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						var node_20 = $.sibling(node_19, 2);

						Toggle(node_20, {
							'aria-label': 'Enable Firewall',
							direction: 'switch-first',
							get checked() {
								return $.get(label);
							},

							set checked($$value) {
								$.set(label, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Enable Firewall');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						$.reset(div_22);

						var div_23 = $.sibling(div_22, 2);
						var node_21 = $.child(div_23);

						Toggle(node_21, {
							'aria-label': 'Enable Firewall',
							size: 'large',
							get checked() {
								return $.get(label);
							},

							set checked($$value) {
								$.set(label, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Enable Firewall');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						var node_22 = $.sibling(node_21, 2);

						Toggle(node_22, {
							'aria-label': 'Enable Firewall',
							size: 'large',
							direction: 'switch-first',
							get checked() {
								return $.get(label);
							},

							set checked($$value) {
								$.set(label, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Enable Firewall');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						$.reset(div_23);

						var div_24 = $.sibling(div_23, 2);
						var node_23 = $.child(div_24);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_23, {
								'aria-label': 'Enable Firewall',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(label);
								},

								set checked($$value) {
									$.set(label, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Enable Firewall');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						}

						var node_24 = $.sibling(node_23, 2);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_24, {
								'aria-label': 'Enable Firewall',
								direction: 'switch-first',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(label);
								},

								set checked($$value) {
									$.set(label, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Enable Firewall');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_24);

						var div_25 = $.sibling(div_24, 2);
						var node_25 = $.child(div_25);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_25, {
								'aria-label': 'Enable Firewall',
								size: 'large',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(label);
								},

								set checked($$value) {
									$.set(label, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Enable Firewall');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});
						}

						var node_26 = $.sibling(node_25, 2);

						{
							let $0 = $.derived(() => ({ checked: LockClosedSmall, unchecked: LockOpenSmall }));

							Toggle(node_26, {
								'aria-label': 'Enable Firewall',
								size: 'large',
								direction: 'switch-first',
								get icon() {
									return $.get($0);
								},

								get checked() {
									return $.get(label);
								},

								set checked($$value) {
									$.set(label, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Enable Firewall');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});
						}

						$.reset(div_25);
						$.reset(div_21);
						$.append($$anchor, div_21);
					};

					var node_27 = $.child(div_20);

					demoAndCode(node_27, () => demo, () => toggleWithLabel);
					$.reset(div_20);
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_12 = root_7();
		var node_28 = $.first_child(fragment_12);

		toggle(node_28);

		var node_29 = $.sibling(node_28, 2);

		defaultToggle(node_29);

		var node_30 = $.sibling(node_29, 2);

		sizes(node_30);

		var node_31 = $.sibling(node_30, 2);

		customColors(node_31);

		var node_32 = $.sibling(node_31, 2);

		withLabel(node_32);

		var node_33 = $.sibling(node_32, 2);

		prevAndNext(node_33);
		$.append($$anchor, fragment_12);
	};

	let checked = false;
	let checked2 = true;
	let checkedCustom = $.state(false);
	let label = $.state(false);

	$.head('mployh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Toggle';
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