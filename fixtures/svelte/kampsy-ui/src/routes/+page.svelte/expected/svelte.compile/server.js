import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import { GridSquare, ListUnordered, Shield, ShieldGlobe, UserPlus } from "$lib/icons/index.js";
import { Badge, Button, Pagination, Switch } from "$lib/index.js";

function foundation($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Kampsy-ui</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A Svelte 5 component library, inspired by Vercel's Geist, is thoughtfully designed to
			provide consistent and cohesive web experiences.</p>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, { next: { title: "installation", href: "/installation" } });
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let value = "";

	function grid($$renderer) {
		$$renderer.push(`<section class="box-border grid grid-cols-1 lg:grid-cols-2"><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-r border-b"><a href="/avatar" class="group hover:bg-kui-light-bg dark:hover:bg-kui-dark-bg block h-full w-full p-[32px] transition-colors"><div class="relative min-h-[104px] w-full"><div class="flex flex-wrap items-center gap-4">`);

		Button($$renderer, {
			variant: 'secondary',
			shape: 'square',
			svgOnly: true,
			'aria-label': 'Globe',
			children: ($$renderer) => {
				ShieldGlobe($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (Switch.Root) {
			$$renderer.push('<!--[-->');

			Switch.Root($$renderer, {
				name: 'size-default',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Switch.Control) {
						$$renderer.push('<!--[-->');
						Switch.Control($$renderer, { defaultChecked: true, icon: GridSquare, value: 'source' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Switch.Control) {
						$$renderer.push('<!--[-->');
						Switch.Control($$renderer, { icon: ListUnordered, value: 'output' });
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

		{
			function prefix($$renderer) {
				UserPlus($$renderer, {});
			}

			Button($$renderer, {
				variant: 'secondary',
				prefix,
				children: ($$renderer) => {
					$$renderer.push(`<!---->collaborate`);
				},
				$$slots: { prefix: true, default: true }
			});
		}

		$$renderer.push(`<!----> <div class="flex items-center gap-1">`);

		Badge($$renderer, {
			icon: Shield,
			size: 'lg',
			variant: 'blue',
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
			children: ($$renderer) => {
				$$renderer.push(`<!---->purple`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Badge($$renderer, {
			icon: Shield,
			size: 'md',
			variant: 'amber',
			contrast: 'low',
			children: ($$renderer) => {
				$$renderer.push(`<!---->purple`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Badge($$renderer, {
			icon: Shield,
			size: 'lg',
			variant: 'red',
			contrast: 'low',
			children: ($$renderer) => {
				$$renderer.push(`<!---->purple`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Button($$renderer, {
			size: 'small',
			shape: 'square',
			svgOnly: true,
			'aria-label': 'Globe',
			children: ($$renderer) => {
				ShieldGlobe($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="babsolute top-0 left-0 h-full w-full"></div></div> <div class="mt-[32px] h-[48px] w-full"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-base leading-6 font-semibold tracking-[-0.32px] first-letter:capitalize">components</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-sm leading-6 first-letter:capitalize">building blocks for svelte applications.</p></div></a></div> <div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-b"><a href="/colors" class="group hover:bg-kui-light-bg dark:hover:bg-kui-dark-bg block h-full w-full p-[32px] transition-colors"><div class="flex justify-between"><div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-gray-800 dark:bg-kui-dark-gray-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-blue-800 dark:bg-kui-dark-blue-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-purple-800 dark:bg-kui-dark-purple-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-pink-800 dark:bg-kui-dark-pink-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-red-800 dark:bg-kui-dark-red-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-amber-800 dark:bg-kui-dark-amber-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-green-800 dark:bg-kui-dark-green-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-teal-800 dark:bg-kui-dark-teal-800 h-[72px] w-2 rounded-full"></div></div></div> <div class="mt-[32px] h-[48px] w-full"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-base leading-6 font-semibold tracking-[-0.32px] first-letter:capitalize">colors</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-sm leading-6 first-letter:capitalize">a high contrast accessible color system.</p></div></a></div></section>`);
	}

	function cont($$renderer) {
		foundation($$renderer);
		$$renderer.push(`<!----> `);
		grid($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Kampsy-ui</title>`);
			});
		});

		Shell($$renderer, { asideSlot: aside, contSlot: cont });
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}