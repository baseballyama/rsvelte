import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Progress from "$lib/progress/progress.svelte";
import { progressDefault, progressDynamicColors, progressThemed } from "../../docs/data/progress.js";
import Button from "$lib/button/button.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const progress = ($$anchor) => {
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

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const defaultProgess = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/progress#default',
				'aria-label': 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					Progress($$anchor, { value: 80 });
				};

				var node_3 = $.child(div_3);

				demoAndCode(node_3, () => demo, () => progressDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const themed = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_2();
			var node_9 = $.first_child(fragment_9);

			LinkH2(node_9, {
				href: '/progress#themed',
				'aria-label': 'themed',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('themed');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var div_6 = $.sibling(node_9, 2);

			{
				const demo = ($$anchor) => {
					var div_7 = root_4();
					var node_10 = $.child(div_7);

					Progress(node_10, { type: 'success', value: 100 });

					var node_11 = $.sibling(node_10, 2);

					Progress(node_11, { type: 'error', value: 10 });

					var node_12 = $.sibling(node_11, 2);

					Progress(node_12, { type: 'warning', value: 40 });

					var node_13 = $.sibling(node_12, 2);

					Progress(node_13, { type: 'secondary', value: 70 });
					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var node_14 = $.child(div_6);

				demoAndCode(node_14, () => demo, () => progressThemed);
				$.reset(div_6);
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
			Pagination($$anchor, {
				previous: { title: "pagination", href: "/pagination" },
				next: { title: "project banner", href: "/project-banner" }
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

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">progress</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display progress relative to a limit or related to a task.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<!> <div class="flex items-center gap-4"><!> <!></div>`, 1);
var root_4 = $.from_html(`<div class="w-full space-y-6"><!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const dynamicColors = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();
				var node_4 = $.first_child(fragment_6);

				LinkH2(node_4, {
					href: '/progress#dynamic-colors',
					'aria-label': 'dynamic-colors',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('dynamic colors');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_4, 2);

				{
					const demo = ($$anchor) => {
						var fragment_7 = root_3();
						var node_5 = $.first_child(fragment_7);

						Progress(node_5, {
							get value() {
								return $.get(dynamic);
							}
						});

						var div_5 = $.sibling(node_5, 2);
						var node_6 = $.child(div_5);

						Button(node_6, {
							onclick: () => {
								if ($.get(dynamic) < 100) {
									$.set(dynamic, $.get(dynamic) + 10);
								}
							},
							size: 'small',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Increase');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						Button(node_7, {
							onclick: () => {
								if ($.get(dynamic) > 0) {
									$.set(dynamic, $.get(dynamic) - 10);
								}
							},
							size: 'small',
							variant: 'secondary',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Decrease');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);
						$.append($$anchor, fragment_7);
					};

					var node_8 = $.child(div_4);

					demoAndCode(node_8, () => demo, () => progressDynamicColors);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_12 = root_5();
		var node_15 = $.first_child(fragment_12);

		progress(node_15);

		var node_16 = $.sibling(node_15, 2);

		defaultProgess(node_16);

		var node_17 = $.sibling(node_16, 2);

		dynamicColors(node_17);

		var node_18 = $.sibling(node_17, 2);

		themed(node_18);

		var node_19 = $.sibling(node_18, 2);

		prevAndNext(node_19);
		$.append($$anchor, fragment_12);
	};

	let dynamic = $.state(40);

	$.head('tllgyw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Progess';
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