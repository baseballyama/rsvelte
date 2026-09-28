import * as $ from 'svelte/internal/server';
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

function textSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Text</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display text using well-defined typographic styles.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> <div class="overflow-hidden rounded-b-xl">`);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div></div>`);
}

function sizeSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-2">`);

				Text($$renderer, {
					size: 48,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 32,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 24,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 20,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 16,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 14,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 12,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 10,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/text#size',
				'aria-label': 'size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, textSize);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function responsiveSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				Text($$renderer, {
					size: { sm: 24, md: 32, lg: 48 },
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/text#responsive',
				'aria-label': 'responsive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->responsive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, textResponsive);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function responsiveVariantSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Text($$renderer, {
					variant: { sm: "heading-24", md: "heading-32", lg: "heading-48" },
					children: ($$renderer) => {
						$$renderer.push(`<!---->Responsive Heading`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					variant: { sm: "copy-14", md: "copy-16", lg: "copy-20" },
					children: ($$renderer) => {
						$$renderer.push(`<!---->Responsive Copy, Lorem ipsum dolor sit amet, consectetur adipiscing elit.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/text#responsive-variants',
				'aria-label': 'responsive-variants',
				children: ($$renderer) => {
					$$renderer.push(`<!---->responsive variants`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, textResponsiveVariant);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function modifiersSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				Text($$renderer, {
					size: 16,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The <strong>Evil Rabbit</strong> <em>jumps</em> over the <s>quick brown fox</s> <u>Lawful Meerkat</u>.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/text#modifiers',
				'aria-label': 'modifiers',
				children: ($$renderer) => {
					$$renderer.push(`<!---->modifiers`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, textModifiers);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function truncateSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				Text($$renderer, {
					size: 16,
					class: 'max-w-25',
					truncate: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Evil Rabbit jumps.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/text#truncate',
				'aria-label': 'truncate',
				children: ($$renderer) => {
					$$renderer.push(`<!---->truncate`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, textTruncate);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "tabs", href: "/tabs" },
				next: { title: "textarea", href: "/textarea" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
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

	function variantSnip($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="w-full space-y-2"><!--[-->`);

					const each_array = $.ensure_array_like(variants);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let variant = each_array[index];

						Text($$renderer, {
							class: 'capitalize',
							variant,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(variant.replace("-", " "))}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div>`);
				}

				LinkH2($$renderer, {
					href: '/text#variants',
					'aria-label': 'variants',
					children: ($$renderer) => {
						$$renderer.push(`<!---->variants`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, textVariants);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		textSnip($$renderer);
		$$renderer.push(`<!----> `);
		sizeSnip($$renderer);
		$$renderer.push(`<!----> `);
		responsiveSnip($$renderer);
		$$renderer.push(`<!----> `);
		variantSnip($$renderer);
		$$renderer.push(`<!----> `);
		responsiveVariantSnip($$renderer);
		$$renderer.push(`<!----> `);
		modifiersSnip($$renderer);
		$$renderer.push(`<!----> `);
		truncateSnip($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	$.head('1e0byms', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Text</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}