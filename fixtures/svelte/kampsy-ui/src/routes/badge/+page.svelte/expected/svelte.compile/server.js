import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import Badge from "$lib/badge/badge.svelte";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { badgeSize, badgeVariants, badgeWithIcon, badgePill } from "$lib/../docs/data/badge.js";
import { ExternalLink, Shield } from "@lucide/svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function badge($$renderer, title, para) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">${$.escape(title)}</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">${$.escape(para)}</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> `);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div>`);
}

function variants($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-2"><div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'gray',
					'aria-label': 'gray',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'gray',
					contrast: 'low',
					'aria-label': 'gray-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'blue',
					'aria-label': 'blue',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'blue',
					contrast: 'low',
					'aria-label': 'blue-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'purple',
					'aria-label': 'purple',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'purple',
					contrast: 'low',
					'aria-label': 'purple-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'amber',
					'aria-label': 'amber',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'amber',
					contrast: 'low',
					'aria-label': 'amber-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'red',
					'aria-label': 'red',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'red',
					contrast: 'low',
					'aria-label': 'red-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'pink',
					'aria-label': 'pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'pink',
					contrast: 'low',
					'aria-label': 'pink-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'green',
					'aria-label': 'green',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'green',
					contrast: 'low',
					'aria-label': 'green-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'teal',
					'aria-label': 'teal',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'teal',
					contrast: 'low',
					'aria-label': 'teal-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal-subtle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					variant: 'inverted',
					'aria-label': 'inverted',
					children: ($$renderer) => {
						$$renderer.push(`<!---->inverted`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'trial',
					'aria-label': 'trial',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Trial`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					variant: 'turbo',
					'aria-label': 'turbo',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Turborepo`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/badge#variants',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Variants`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, badgeVariants);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function size($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex items-center gap-2"><div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					size: 'sm',
					'aria-label': 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->small`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					size: 'md',
					'aria-label': 'medium',
					children: ($$renderer) => {
						$$renderer.push(`<!---->medium`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex gap-1 capitalize">`);

				Badge($$renderer, {
					size: 'lg',
					'aria-label': 'large',
					children: ($$renderer) => {
						$$renderer.push(`<!---->large`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/badge#sizes',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sizes`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, badgeSize);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function icons($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-2"><div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'gray',
					'aria-label': 'icon large gray',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'gray',
					'aria-label': 'icon medium gray',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'gray',
					'aria-label': 'icon small gray',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'gray',
					contrast: 'low',
					'aria-label': 'icon small gray-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'gray',
					contrast: 'low',
					'aria-label': 'icon medium gray-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'gray',
					contrast: 'low',
					'aria-label': 'icon large gray-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->gray`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'blue',
					'aria-label': 'icon large blue',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'blue',
					'aria-label': 'icon medium blue',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'blue',
					'aria-label': 'icon small blue',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'blue',
					contrast: 'low',
					'aria-label': 'icon small blue-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'blue',
					contrast: 'low',
					'aria-label': 'icon medium blue-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'blue',
					contrast: 'low',
					'aria-label': 'icon large blue-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->blue`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'purple',
					'aria-label': 'icon large purple',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'purple',
					'aria-label': 'icon medium purple',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'purple',
					'aria-label': 'icon small purple',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'purple',
					contrast: 'low',
					'aria-label': 'icon small purple-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'purple',
					contrast: 'low',
					'aria-label': 'icon medium purple-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'purple',
					contrast: 'low',
					'aria-label': 'icon large purple-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->purple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'amber',
					'aria-label': 'icon large amber',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'amber',
					'aria-label': 'icon medium amber',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'amber',
					'aria-label': 'icon small amber',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'amber',
					contrast: 'low',
					'aria-label': 'icon small amber-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'amber',
					contrast: 'low',
					'aria-label': 'icon medium amber-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'amber',
					contrast: 'low',
					'aria-label': 'icon large amber-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->amber`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'red',
					'aria-label': 'icon large red',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'red',
					'aria-label': 'icon medium red',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'red',
					'aria-label': 'icon small red',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'red',
					contrast: 'low',
					'aria-label': 'icon small red-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'red',
					contrast: 'low',
					'aria-label': 'icon medium red-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'red',
					contrast: 'low',
					'aria-label': 'icon large red-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->red`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'pink',
					'aria-label': 'icon large pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'pink',
					'aria-label': 'icon medium pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'pink',
					'aria-label': 'icon small pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'pink',
					contrast: 'low',
					'aria-label': 'icon small pink-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'pink',
					contrast: 'low',
					'aria-label': 'icon medium pink-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'pink',
					contrast: 'low',
					'aria-label': 'icon large pink-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->pink`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'green',
					'aria-label': 'icon large green',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'green',
					'aria-label': 'icon medium green',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'green',
					'aria-label': 'icon small green',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'green',
					contrast: 'low',
					'aria-label': 'icon small green-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'green',
					contrast: 'low',
					'aria-label': 'icon medium green-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'green',
					contrast: 'low',
					'aria-label': 'icon large green-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->green`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'teal',
					'aria-label': 'icon large teal',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'teal',
					'aria-label': 'icon medium teal',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'teal',
					'aria-label': 'icon small teal',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'teal',
					contrast: 'low',
					'aria-label': 'icon small teal-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'teal',
					contrast: 'low',
					'aria-label': 'icon medium teal-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'teal',
					contrast: 'low',
					'aria-label': 'icon large teal-subtle',
					children: ($$renderer) => {
						$$renderer.push(`<!---->teal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-1 capitalize">`);

				Badge($$renderer, {
					icon: Shield,
					size: 'lg',
					variant: 'inverted',
					'aria-label': 'icon large inverted',
					children: ($$renderer) => {
						$$renderer.push(`<!---->inverted`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'md',
					variant: 'inverted',
					'aria-label': 'icon medium inverted',
					children: ($$renderer) => {
						$$renderer.push(`<!---->inverted`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					icon: Shield,
					size: 'sm',
					variant: 'inverted',
					'aria-label': 'icon small inverted',
					children: ($$renderer) => {
						$$renderer.push(`<!---->inverted`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/badge#with-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->With Icons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, badgeWithIcon);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function pill($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2 capitalize">`);

				Badge($$renderer, {
					href: '/badge#pill',
					size: 'sm',
					variant: 'pill',
					'aria-label': 'large pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					href: '/badge#pill',
					size: 'md',
					variant: 'pill',
					'aria-label': 'medium pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					href: '/badge#pill',
					size: 'lg',
					variant: 'pill',
					'aria-label': 'small pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2 capitalize">`);

				Badge($$renderer, {
					href: '/badge#pill',
					icon: ExternalLink,
					size: 'sm',
					variant: 'pill',
					'aria-label': 'icon large pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					href: '/badge#pill',
					icon: ExternalLink,
					size: 'md',
					variant: 'pill',
					'aria-label': 'icon medium pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					href: '/badge#pill',
					icon: ExternalLink,
					size: 'lg',
					variant: 'pill',
					'aria-label': 'icon small pill',
					children: ($$renderer) => {
						$$renderer.push(`<!---->label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/badge#pill',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Pill`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">A special link, not quite as prominent as a button, based on `);
			roundedCode($$renderer, "<Badge />");
			$$renderer.push(`<!----> styling.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, badgePill);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function bestPractices($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/badge#best-practices',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Best Practices`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <ul class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-4 list-disc space-y-2 pl-5 text-[14px] leading-6 md:text-[16px] xl:mt-7"><li>Use Badge for short, scannable metadata that sits next to the thing it describes:
				status, plan tier, environment, or role. One badge per row; two side by side is a sign
				the row needs a second column.</li> <li>For a colored dot without text, use `);

			roundedCode($$renderer, "StatusDot");

			$$renderer.push(`<!---->. For clickable
				filter chips that toggle a query, use the `);

			roundedCode($$renderer, "pill");
			$$renderer.push(`<!----> variant or a small `);
			roundedCode($$renderer, "Button");
			$$renderer.push(`<!---->.</li> <li>Badges are static labels. Don’t wire `);
			roundedCode($$renderer, "on:click");

			$$renderer.push(`<!----> onto them; promote
				to a `);

			roundedCode($$renderer, "Button");
			$$renderer.push(`<!----> or link if the user can act on the value.</li> <li>Keep badge content to text or `);
			roundedCode($$renderer, "icon");

			$$renderer.push(`<!----> + text. Never stack two icons
				or a child Badge inside a Badge.</li> <li>Pair lifecycle badges (`);

			roundedCode($$renderer, "Alpha");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Beta");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Early Access");
			$$renderer.push(`<!---->) with a `);
			roundedCode($$renderer, "Tooltip");

			$$renderer.push(`<!----> that names
				the limit, like `);

			roundedCode($$renderer, "Alpha: API may change before GA");
			$$renderer.push(`<!---->.</li> <li>Title Case, one word when possible, two max: `);
			roundedCode($$renderer, "Active");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Pending");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Pro");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Enterprise Trial");
			$$renderer.push(`<!---->. Match the canonical API or log term: `);
			roundedCode($$renderer, "Production");
			$$renderer.push(`<!----> not `);
			roundedCode($$renderer, "Prod");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Deployed");
			$$renderer.push(`<!----> not `);
			roundedCode($$renderer, "Live");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Canceled");
			$$renderer.push(`<!----> not `);
			roundedCode($$renderer, "Cancelled");

			$$renderer.push(`<!----> (the Vercel API
				uses one L).</li> <li>Don’t add a checkmark icon for success states or an X for errors; the variant carries
				that signal. Map meaning to color: `);

			roundedCode($$renderer, "green");
			$$renderer.push(`<!----> for healthy, `);
			roundedCode($$renderer, "red");
			$$renderer.push(`<!----> for error, `);
			roundedCode($$renderer, "amber");
			$$renderer.push(`<!----> for warning, `);
			roundedCode($$renderer, "blue");
			$$renderer.push(`<!----> for informational or production, `);
			roundedCode($$renderer, "gray");
			$$renderer.push(`<!----> for neutral. Use `);
			roundedCode($$renderer, 'contrast="low"');

			$$renderer.push(`<!----> to tone any of them down on dense
				surfaces.</li> <li>Skip stuffing sentences inside (`);

			roundedCode($$renderer, "Currently Active");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "You are on Pro");
			$$renderer.push(`<!---->); the surrounding row supplies the context.</li> <li>Set `);
			roundedCode($$renderer, "title");

			$$renderer.push(`<!----> for icon-only or ambiguous badges so screen readers announce
				the meaning. Don’t rely on color alone; the text has to be readable without it.</li></ul>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "avatar", href: "/avatar" },
				next: { title: "button", href: "/button" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	const contHeading = {
		title: "badge",
		para: `A label that emphasizes an element that requires attention, or helps categorize with other
			similar elements.`
	};

	function cont($$renderer) {
		badge($$renderer, contHeading.title, contHeading.para);
		$$renderer.push(`<!----> <section>`);
		variants($$renderer);
		$$renderer.push(`<!----> `);
		size($$renderer);
		$$renderer.push(`<!----> `);
		icons($$renderer);
		$$renderer.push(`<!----> `);
		pill($$renderer);
		$$renderer.push(`<!----> `);
		bestPractices($$renderer);
		$$renderer.push(`<!----></section> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	$.head('iy2a3g', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Badge</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}