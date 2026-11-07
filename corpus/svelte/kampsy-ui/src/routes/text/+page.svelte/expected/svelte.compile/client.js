import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Text } from "$lib/index.js";

import {
	textModifiers,
	textResponsive,
	textResponsiveVariant,
	textSize,
	textTruncate,
	textVariants
} from "../../docs/data/text.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const textSnip = ($$anchor) => {
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

const sizeSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/text#size',
				'aria-label': 'size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('size');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_5 = root_2();
					var node_3 = $.child(div_5);

					Text(node_3, {
						size: 48,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Text(node_4, {
						size: 32,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Text(node_5, {
						size: 24,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Text(node_6, {
						size: 20,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Text(node_7, {
						size: 16,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Text(node_8, {
						size: 14,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Text(node_9, {
						size: 12,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Text(node_10, {
						size: 10,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var node_11 = $.child(div_4);

				demoAndCode(node_11, () => demo, () => textSize);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const responsiveSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_12 = $.first_child(fragment_5);

			LinkH2(node_12, {
				href: '/text#responsive',
				'aria-label': 'responsive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('responsive');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var div_6 = $.sibling(node_12, 2);

			{
				const demo = ($$anchor) => {
					var div_7 = root_4();
					var node_13 = $.child(div_7);

					Text(node_13, {
						size: { sm: 24, md: 32, lg: 48 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var node_14 = $.child(div_6);

				demoAndCode(node_14, () => demo, () => textResponsive);
				$.reset(div_6);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const responsiveVariantSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_3();
			var node_17 = $.first_child(fragment_11);

			LinkH2(node_17, {
				href: '/text#responsive-variants',
				'aria-label': 'responsive-variants',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('responsive variants');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var div_10 = $.sibling(node_17, 2);

			{
				const demo = ($$anchor) => {
					var div_11 = root_6();
					var node_18 = $.child(div_11);

					Text(node_18, {
						variant: { sm: "heading-24", md: "heading-32", lg: "heading-48" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Responsive Heading');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Text(node_19, {
						variant: { sm: "copy-14", md: "copy-16", lg: "copy-20" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Responsive Copy, Lorem ipsum dolor sit amet, consectetur adipiscing elit.');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				var node_20 = $.child(div_10);

				demoAndCode(node_20, () => demo, () => textResponsiveVariant);
				$.reset(div_10);
			}

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const modifiersSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_3();
			var node_21 = $.first_child(fragment_13);

			LinkH2(node_21, {
				href: '/text#modifiers',
				'aria-label': 'modifiers',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('modifiers');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var div_12 = $.sibling(node_21, 2);

			{
				const demo = ($$anchor) => {
					var div_13 = root_4();
					var node_22 = $.child(div_13);

					Text(node_22, {
						size: 16,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_14 = root_7();

							$.next(8);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				var node_23 = $.child(div_12);

				demoAndCode(node_23, () => demo, () => textModifiers);
				$.reset(div_12);
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const truncateSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_3();
			var node_24 = $.first_child(fragment_16);

			LinkH2(node_24, {
				href: '/text#truncate',
				'aria-label': 'truncate',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('truncate');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var div_14 = $.sibling(node_24, 2);

			{
				const demo = ($$anchor) => {
					var div_15 = root_4();
					var node_25 = $.child(div_15);

					Text(node_25, {
						size: 16,
						class: 'max-w-25',
						truncate: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('The Evil Rabbit jumps.');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				var node_26 = $.child(div_14);

				demoAndCode(node_26, () => demo, () => textTruncate);
				$.reset(div_14);
			}

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "tabs", href: "/tabs" },
				next: { title: "textarea", href: "/textarea" }
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

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Text</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display text using well-defined typographic styles.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<div class="w-full space-y-2"><!> <!> <!> <!> <!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="w-full"><!></div>`);
var root_5 = $.from_html(`<div class="w-full space-y-2"></div>`);
var root_6 = $.from_html(`<div class="w-full space-y-6"><!> <!></div>`);
var root_7 = $.from_html(`The <strong>Evil Rabbit</strong> <em>jumps</em> over the <s>quick brown fox</s> <u>Lawful Meerkat</u>.`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const variantSnip = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_3();
				var node_15 = $.first_child(fragment_7);

				LinkH2(node_15, {
					href: '/text#variants',
					'aria-label': 'variants',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('variants');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var div_8 = $.sibling(node_15, 2);

				{
					const demo = ($$anchor) => {
						var div_9 = root_5();

						$.each(div_9, 21, () => variants, $.index, ($$anchor, variant) => {
							Text($$anchor, {
								class: 'capitalize',
								get variant() {
									return $.get(variant);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text();

									$.template_effect(($0) => $.set_text(text_12, $0), [() => $.get(variant).replace("-", " ")]);
									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_9);
						$.append($$anchor, div_9);
					};

					var node_16 = $.child(div_8);

					demoAndCode(node_16, () => demo, () => textVariants);
					$.reset(div_8);
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_19 = root_8();
		var node_27 = $.first_child(fragment_19);

		textSnip(node_27);

		var node_28 = $.sibling(node_27, 2);

		sizeSnip(node_28);

		var node_29 = $.sibling(node_28, 2);

		responsiveSnip(node_29);

		var node_30 = $.sibling(node_29, 2);

		variantSnip(node_30);

		var node_31 = $.sibling(node_30, 2);

		responsiveVariantSnip(node_31);

		var node_32 = $.sibling(node_31, 2);

		modifiersSnip(node_32);

		var node_33 = $.sibling(node_32, 2);

		truncateSnip(node_33);

		var node_34 = $.sibling(node_33, 2);

		prevAndNext(node_34);
		$.append($$anchor, fragment_19);
	};

	const variants = [
		"heading-72",
		"heading-64",
		"heading-56",
		"heading-48",
		"heading-40",
		"heading-32",
		"heading-24",
		"heading-20",
		"heading-16",
		"button-16",
		"button-14",
		"button-12",
		"label-20",
		"label-18",
		"label-16",
		"label-14",
		"label-13",
		"label-12",
		"copy-24",
		"copy-20",
		"copy-18",
		"copy-16",
		"copy-14",
		"copy-13"
	];

	$.head('1e0byms', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Text';
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