import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import { GridSquare, ListUnordered, Shield, ShieldGlobe, UserPlus } from "$lib/icons/index.js";
import { Badge, Button, Pagination, Switch } from "$lib/index.js";

const foundation = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, { next: { title: "installation", href: "/installation" } });
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

var root = $.from_html(
	`<h1 class=" text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Kampsy-ui</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A Svelte 5 component library, inspired by Vercel's Geist, is thoughtfully designed to
			provide consistent and cohesive web experiences.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<section class="box-border grid grid-cols-1 lg:grid-cols-2"><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-r border-b"><a href="/avatar" class="group hover:bg-kui-light-bg dark:hover:bg-kui-dark-bg block h-full w-full p-[32px] transition-colors"><div class="relative min-h-[104px] w-full"><div class="flex flex-wrap items-center gap-4"><!> <!> <!> <div class="flex items-center gap-1"><!> <!> <!> <!></div> <!></div> <div class="babsolute top-0 left-0 h-full w-full"></div></div> <div class="mt-[32px] h-[48px] w-full"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-base leading-6 font-semibold tracking-[-0.32px] first-letter:capitalize">components</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-sm leading-6 first-letter:capitalize">building blocks for svelte applications.</p></div></a></div> <div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-b"><a href="/colors" class="group hover:bg-kui-light-bg dark:hover:bg-kui-dark-bg block h-full w-full p-[32px] transition-colors"><div class="flex justify-between"><div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-gray-800 dark:bg-kui-dark-gray-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-blue-800 dark:bg-kui-dark-blue-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-purple-800 dark:bg-kui-dark-purple-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-pink-800 dark:bg-kui-dark-pink-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-red-800 dark:bg-kui-dark-red-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-amber-800 dark:bg-kui-dark-amber-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-green-800 dark:bg-kui-dark-green-800 h-[72px] w-2 rounded-full"></div></div> <div class="bg-background-200 border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 flex h-[96px] w-8 items-center justify-center overflow-hidden rounded-full border"><div class="bg-kui-light-teal-800 dark:bg-kui-dark-teal-800 h-[72px] w-2 rounded-full"></div></div></div> <div class="mt-[32px] h-[48px] w-full"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-base leading-6 font-semibold tracking-[-0.32px] first-letter:capitalize">colors</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-sm leading-6 first-letter:capitalize">a high contrast accessible color system.</p></div></a></div></section>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	const grid = ($$anchor) => {
		var section = root_2();
		var div = $.child(section);
		var a = $.child(div);
		var div_1 = $.child(a);
		var div_2 = $.child(div_1);
		var node = $.child(div_2);

		Button(node, {
			variant: 'secondary',
			shape: 'square',
			svgOnly: true,
			'aria-label': 'Globe',
			children: ($$anchor, $$slotProps) => {
				ShieldGlobe($$anchor, {});
			},
			$$slots: { default: true }
		});

		var node_1 = $.sibling(node, 2);

		$.component(node_1, () => Switch.Root, ($$anchor, Switch_Root) => {
			Switch_Root($$anchor, {
				name: 'size-default',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => Switch.Control, ($$anchor, Switch_Control) => {
						Switch_Control($$anchor, {
							defaultChecked: true,
							get icon() {
								return GridSquare;
							},
							value: 'source'
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Switch.Control, ($$anchor, Switch_Control_1) => {
						Switch_Control_1($$anchor, {
							get icon() {
								return ListUnordered;
							},
							value: 'output'
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});

		var node_4 = $.sibling(node_1, 2);

		{
			const prefix = ($$anchor) => {
				UserPlus($$anchor, {});
			};

			Button(node_4, {
				variant: 'secondary',
				prefix,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('collaborate');

					$.append($$anchor, text);
				},
				$$slots: { prefix: true, default: true }
			});
		}

		var div_3 = $.sibling(node_4, 2);
		var node_5 = $.child(div_3);

		Badge(node_5, {
			get icon() {
				return Shield;
			},
			size: 'lg',
			variant: 'blue',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('purple');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});

		var node_6 = $.sibling(node_5, 2);

		Badge(node_6, {
			get icon() {
				return Shield;
			},
			size: 'md',
			variant: 'purple',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('purple');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		var node_7 = $.sibling(node_6, 2);

		Badge(node_7, {
			get icon() {
				return Shield;
			},
			size: 'md',
			variant: 'amber',
			contrast: 'low',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('purple');

				$.append($$anchor, text_3);
			},
			$$slots: { default: true }
		});

		var node_8 = $.sibling(node_7, 2);

		Badge(node_8, {
			get icon() {
				return Shield;
			},
			size: 'lg',
			variant: 'red',
			contrast: 'low',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('purple');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});

		$.reset(div_3);

		var node_9 = $.sibling(div_3, 2);

		Button(node_9, {
			size: 'small',
			shape: 'square',
			svgOnly: true,
			'aria-label': 'Globe',
			children: ($$anchor, $$slotProps) => {
				ShieldGlobe($$anchor, {});
			},
			$$slots: { default: true }
		});

		$.reset(div_2);
		$.next(2);
		$.reset(div_1);
		$.next(2);
		$.reset(a);
		$.reset(div);
		$.next(2);
		$.reset(section);
		$.append($$anchor, section);
	};

	const cont = ($$anchor) => {
		var fragment_8 = root_3();
		var node_10 = $.first_child(fragment_8);

		foundation(node_10);

		var node_11 = $.sibling(node_10, 2);

		grid(node_11);

		var node_12 = $.sibling(node_11, 2);

		prevAndNext(node_12);
		$.append($$anchor, fragment_8);
	};

	let value = $.state("");

	$.head('1uha8ag', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Kampsy-ui';
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