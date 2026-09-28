import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import Button from "$lib/button/button.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Text from "$lib/text/text.svelte";
import Tooltip from "$lib/tooltip/tooltip.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";
import { gray, grayAlpha, blue, red, amber, green, teal, purple, pink } from "../../docs/data/colors.js";
import Hr from "../../docs/ui/hr.svelte";

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">colors</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Learn how to use our color system. Hover over each color to view the corresponding
			colors.</p>`);
		},
		$$slots: { default: true }
	});
}

function colSnip($$renderer, title, colorList) {
	$$renderer.push(`<div class="flex flex-col items-start gap-2 md:flex-row md:items-center"><div class="w-25 shrink-0"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-medium first-letter:capitalize">${$.escape(title)}</p></div> <ul class="flex w-full gap-1 md:gap-2"><!--[-->`);

	const each_array = $.ensure_array_like(colorList);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let item = each_array[index];

		$$renderer.push(`<li class="w-full max-w-17">`);

		Tooltip($$renderer, {
			position: 'top',
			text: item,
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex h-full w-full items-center"><button${$.attr('aria-label', item)}${$.attr_class(`border-kui-light-gray-alpha-200/5 dark:border-kui-dark-gray-alpha-200/5 h-7.5 w-full rounded-sm border md:h-10 ${$.stringify(item)}`)}></button></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li>`);
	}

	$$renderer.push(`<!--]--></ul></div>`);
}

function scales($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#size',
				'aria-label': 'size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">There are 10 color scales in the system. P3 colors are used on supported browsers and
			displays.</p> <div class="mt-5 space-y-6 xl:mt-10"><div class="flex flex-col items-start gap-2 md:flex-row md:items-center"><div class="w-25 shrink-0"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-medium capitalize">background</p></div> <ul class="flex w-full gap-1 md:gap-2"><li class="flex w-18 items-center gap-1 md:w-38 md:gap-2"><ul class="flex w-full items-center gap-1 md:gap-2"><li class="w-full max-w-17">`);

			Tooltip($$renderer, {
				position: 'top',
				text: 'bg-kui-light-bg rounded-sm dark:bg-kui-dark-bg',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-full w-full items-center"><button aria-label="gray" class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg dark:bg-kui-dark-bg h-8.5 w-full rounded-sm border lg:h-10"></button></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li class="w-full max-w-17">`);

			Tooltip($$renderer, {
				position: 'top',
				text: 'bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-full w-full items-center"><button aria-label="gray alpha" class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary h-8.5 w-full rounded-sm border lg:h-10"></button></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li></ul></li></ul></div> `);
			colSnip($$renderer, "gray", gray);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "gray alpha", grayAlpha);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "blue", blue);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "red", red);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "amber", amber);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "green", green);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "teal", teal);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "purple", purple);
			$$renderer.push(`<!----> `);
			colSnip($$renderer, "pink", pink);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function backgrounds($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#backgrounds',
				'aria-label': 'backgrounds',
				children: ($$renderer) => {
					$$renderer.push(`<!---->backgrounds`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">There are two background colors for pages and UI components. In most instances, you
			should use Background 1—especially when color is being placed on top of the background.
			Background 2 should be used sparingly when a subtle background differentiation is needed.</p> <div class="w-full py-5"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'bg-kui-light-bg dark:bg-kui-dark-bg',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg dark:bg-kui-dark-bg h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Background 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default element background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-2' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Background 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 mt-10 flex h-175 w-full flex-col border md:h-103 md:flex-row"><div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 flex h-[50%] items-center justify-center border-r md:h-full md:w-[50%]"><div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 relative flex h-41 w-41 items-center justify-center rounded-xl border"><div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 flex h-6 w-6 items-center justify-center rounded-full text-xs">1</div> <div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 absolute bottom-[-57px] flex h-6 w-6 items-center justify-center rounded-full text-xs">2</div></div></div> <div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary flex h-[50%] items-center justify-center md:h-full md:w-[50%]"><div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 relative flex h-[164px] w-[164px] items-center justify-center rounded-[12px] border"><div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 flex h-6 w-6 items-center justify-center rounded-full text-xs">1</div> <div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 absolute bottom-[-57px] flex h-6 w-6 items-center justify-center rounded-full text-xs">2</div></div></div></div>`);
		},
		$$slots: { default: true }
	});
}

function compactBackgrounds($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#colors-1-3:-component-backgrounds',
				'aria-label': 'Colors 1-3: Component Backgrounds',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Colors 1-3: Component Backgrounds`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These three colors are designed for UI component backgrounds.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'bg-kui-light-gray-100 dark:bg-kui-dark-gray-100',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'bg-kui-light-gray-200 dark:bg-kui-dark-gray-200',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-200 dark:bg-kui-dark-gray-200 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hover background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'bg-kui-light-gray-300 dark:bg-kui-dark-gray-300',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-300 dark:bg-kui-dark-gray-300 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 3`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Active background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">If your UI component’s default background is Background 1, you can use Color 1 as your
			hover background and Color 2 as your active background. On smaller UI elements like
			badges, you can use Color 2 or Color 3 as the background.</p>`);
		},
		$$slots: { default: true }
	});
}

function borders($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#colors-4-6:-borders',
				'aria-label': 'Colors 4-6: Borders',
				children: ($$renderer) => {
					$$renderer.push(`<!---->colors 4-6: borders`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These three colors are designed for UI component borders.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-400 dark:bg-kui-dark-gray-400 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 4`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default border`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-500 dark:border-kui-dark-gray-500',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-500 dark:bg-kui-dark-gray-500 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 5`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hover border`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-600 dark:border-kui-dark-gray-600',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-600 dark:bg-kui-dark-gray-600 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 6`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Active border`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 mt-10 flex h-[136px] w-full items-center justify-center border">`);

			Button($$renderer, {
				variant: 'secondary',
				class: 'min-w-[160px]',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New Project`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function contrast($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#colors-7-8:-high-contrast-backgrounds',
				'aria-label': 'Colors 7-8: High Contrast Backgrounds',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Colors 7-8: High Contrast Backgrounds`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These two colors are designed for high contrast UI component backgrounds.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-700 dark:border-kui-dark-gray-700',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-700 dark:bg-kui-dark-gray-700 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 7`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->High contrast background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-800 dark:border-kui-dark-gray-800',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-800 dark:bg-kui-dark-gray-800 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 8`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hover high contrast background`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}

function textIcon($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/colors#colors-9-10:-text-and-icons',
				'aria-label': 'Colors 9-10: Text and Icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Colors 9-10: Text and Icons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These two colors are designed for accessible text and icons.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-900 dark:border-kui-dark-gray-700',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-900 dark:bg-kui-dark-gray-900 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 9`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary text and icons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);
			Hr($$renderer, { class: 'py-3' });
			$$renderer.push(`<!----> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4">`);

			Tooltip($$renderer, {
				position: 'right',
				text: 'border-kui-light-gray-1000 dark:border-kui-dark-gray-1000',
				class: 'h-full w-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 h-4 w-4 rounded-full border"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Color 10`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Text($$renderer, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary text and icons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "installation", href: "/installation" },
				next: { title: "avatar", href: "/avatar" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	error($$renderer);
	$$renderer.push(`<!----> `);
	scales($$renderer);
	$$renderer.push(`<!----> `);
	backgrounds($$renderer);
	$$renderer.push(`<!----> `);
	compactBackgrounds($$renderer);
	$$renderer.push(`<!----> `);
	borders($$renderer);
	$$renderer.push(`<!----> `);
	contrast($$renderer);
	$$renderer.push(`<!----> `);
	textIcon($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('f1j3j9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Colors</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}