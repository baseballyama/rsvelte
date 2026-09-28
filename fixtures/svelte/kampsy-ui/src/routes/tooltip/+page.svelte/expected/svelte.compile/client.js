import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Tooltip from "$lib/tooltip/tooltip.svelte";
import { tooltipComponents, toolTipCustomType, toolTipDefault } from "../../docs/data/tooltip.js";
import Button from "$lib/button/button.svelte";
import { Badge } from "$lib/index.js";
import Spinner from "$lib/spinner/spinner.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const tooltip = ($$anchor) => {
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

const defaultTooltip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_7();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/tooltip#default',
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
					var fragment_4 = root_6();
					var div_5 = $.first_child(fragment_4);
					var node_3 = $.child(div_5);

					Tooltip(node_3, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'top',
						children: ($$anchor, $$slotProps) => {
							var span = root_2();

							$.append($$anchor, span);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_4 = $.child(div_6);

					Tooltip(node_4, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'bottom',
						children: ($$anchor, $$slotProps) => {
							var span_1 = root_3();

							$.append($$anchor, span_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_5 = $.child(div_7);

					Tooltip(node_5, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'right',
						children: ($$anchor, $$slotProps) => {
							var span_2 = root_4();

							$.append($$anchor, span_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var node_6 = $.child(div_8);

					Tooltip(node_6, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'left',
						children: ($$anchor, $$slotProps) => {
							var span_3 = root_5();

							$.append($$anchor, span_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.append($$anchor, fragment_4);
				};

				var node_7 = $.child(div_4);

				demoAndCode(node_7, () => demo, () => toolTipDefault);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const customType = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_7();
			var node_8 = $.first_child(fragment_6);

			LinkH2(node_8, {
				href: '/tooltip#custom-type',
				'aria-label': 'custom type',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('custom type');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_9 = $.sibling(node_8, 2);

			{
				const demo = ($$anchor) => {
					var fragment_7 = root_6();
					var div_10 = $.first_child(fragment_7);
					var node_9 = $.child(div_10);

					Tooltip(node_9, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'top',
						type: 'success',
						children: ($$anchor, $$slotProps) => {
							var span_4 = root_2();

							$.append($$anchor, span_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_10);

					var div_11 = $.sibling(div_10, 2);
					var node_10 = $.child(div_11);

					Tooltip(node_10, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'bottom',
						type: 'error',
						children: ($$anchor, $$slotProps) => {
							var span_5 = root_3();

							$.append($$anchor, span_5);
						},
						$$slots: { default: true }
					});

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var node_11 = $.child(div_12);

					Tooltip(node_11, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'right',
						type: 'warning',
						children: ($$anchor, $$slotProps) => {
							var span_6 = root_4();

							$.append($$anchor, span_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var node_12 = $.child(div_13);

					Tooltip(node_12, {
						text: 'The Evil Rabbit Jumped over the Fence',
						position: 'left',
						type: 'violet',
						children: ($$anchor, $$slotProps) => {
							var span_7 = root_5();

							$.append($$anchor, span_7);
						},
						$$slots: { default: true }
					});

					$.reset(div_13);
					$.append($$anchor, fragment_7);
				};

				var node_13 = $.child(div_9);

				demoAndCode(node_13, () => demo, () => toolTipCustomType);
				$.reset(div_9);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const components = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_7();
			var node_14 = $.first_child(fragment_9);

			LinkH2(node_14, {
				href: '/tooltip#components',
				'aria-label': 'components',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('components');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_14 = $.sibling(node_14, 2);

			{
				const demo = ($$anchor) => {
					var fragment_10 = root_8();
					var node_15 = $.first_child(fragment_10);

					Tooltip(node_15, {
						position: 'bottom',
						text: 'The Evil Rabbit Jumped over the Fence',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'small',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Bottom');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Tooltip(node_16, {
						position: 'right',
						text: 'The Evil Rabbit Jumped over the Fence',
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Tooltip(node_17, {
						position: 'left',
						text: 'The Evil Rabbit Jumped over the Fence',
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('LEFT');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				};

				var node_18 = $.child(div_14);

				demoAndCode(node_18, () => demo, () => tooltipComponents);
				$.reset(div_14);
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, { previous: { title: "toggle", href: "/toggle" } });
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_16 = root_9();
	var node_19 = $.first_child(fragment_16);

	tooltip(node_19);

	var node_20 = $.sibling(node_19, 2);

	defaultTooltip(node_20);

	var node_21 = $.sibling(node_20, 2);

	customType(node_21);

	var node_22 = $.sibling(node_21, 2);

	components(node_22);

	var node_23 = $.sibling(node_22, 2);

	prevAndNext(node_23);
	$.append($$anchor, fragment_16);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Tooltip</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A set of headings, vertically stacked, that each reveal an related section of content.
			Commonly referred to as an accordion.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<span>Top</span>`);
var root_3 = $.from_html(`<span>Bottom</span>`);
var root_4 = $.from_html(`<span>Right</span>`);
var root_5 = $.from_html(`<span>Left</span>`);
var root_6 = $.from_html(`<div><!></div> <div><!></div> <div><!></div> <div><!></div>`, 1);
var root_7 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('52ybyk', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tooltip';
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