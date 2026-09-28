import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Kbd, Pagination } from "$lib/index.js";
import { keyboardInputModifiers } from "$lib/../docs/data/keyboard-input.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const keyboardInputDefault = ($$anchor) => {
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

const keyboardInputModifiersSnippet = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_4();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/keyboard-input#modifiers',
				'aria-label': 'modifiers',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Modifiers');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_4 = root_3();
					var node_3 = $.child(div_4);

					$.component(node_3, () => Kbd.Group, ($$anchor, Kbd_Group) => {
						Kbd_Group($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_2();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root) => {
									Kbd_Root($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('⌘');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
									Kbd_Root_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('⇧');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
									Kbd_Root_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('⌥');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Kbd.Root, ($$anchor, Kbd_Root_3) => {
									Kbd_Root_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('⌃');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_8 = $.child(div_3);

				demoAndCode(node_8, () => demo, () => keyboardInputModifiers);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "input", href: "/input" },
				next: { title: "menu", href: "/menu" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_7 = root_5();
	var node_9 = $.first_child(fragment_7);

	keyboardInputDefault(node_9);

	var node_10 = $.sibling(node_9, 2);

	keyboardInputModifiersSnippet(node_10);

	var node_11 = $.sibling(node_10, 2);

	prevAndNext(node_11);
	$.append($$anchor, fragment_7);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Keyboard Input</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display keyboard input that triggers an action.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1en9ayd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Keyboard Input';
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