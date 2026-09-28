import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Error from "$lib/error/error.svelte";
import { errorCustomLabel, errorDefault, errorSize, errorWithProp } from "$lib/../docs/data/error.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const error = ($$anchor) => {
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

const defaultErr = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/error#default',
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
					var div_4 = root_2();
					var node_3 = $.child(div_4);

					Error(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('This email address is already in use.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_4 = $.child(div_3);

				demoAndCode(node_4, () => demo, () => errorDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const customLabel = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_5 = $.first_child(fragment_5);

			LinkH2(node_5, {
				href: '/error#custome-label',
				'aria-label': 'custom-label',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('custom label');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_5, 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_2();
					var node_6 = $.child(div_6);

					Error(node_6, {
						label: 'Email Error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('This email address is already in use.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_7 = $.child(div_5);

				demoAndCode(node_7, () => demo, () => errorCustomLabel);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const size = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_3();
			var node_8 = $.first_child(fragment_7);

			LinkH2(node_8, {
				href: '/error#size',
				'aria-label': 'size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('size');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_8, 2);

			{
				const demo = ($$anchor) => {
					var fragment_8 = root_4();
					var node_9 = $.first_child(fragment_8);

					Error(node_9, {
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('This email is in use.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Error(node_10, {
						size: 'md',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('This email is in use.');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Error(node_11, {
						size: 'lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('This email is in use.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				};

				var node_12 = $.child(div_7);

				demoAndCode(node_12, () => demo, () => errorSize);
				$.reset(div_7);
			}

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});
};

const withErrorProp = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_3();
			var node_13 = $.first_child(fragment_10);

			LinkH2(node_13, {
				href: '/error#with-an-error-property',
				'aria-label': 'With an error property',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('With an error property');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_13, 2);

			{
				const demo = ($$anchor) => {
					Error($$anchor, {
						error: {
							message: "The request failed.",
							action: "Contact Us",
							link: "https://ui.kampsy.xyz/error"
						}
					});
				};

				var node_14 = $.child(div_8);

				demoAndCode(node_14, () => demo, () => errorWithProp);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "empty state", href: "/empty-state" },
				next: { title: "input", href: "/input" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_14 = root_5();
	var node_15 = $.first_child(fragment_14);

	error(node_15);

	var node_16 = $.sibling(node_15, 2);

	defaultErr(node_16);

	var node_17 = $.sibling(node_16, 2);

	customLabel(node_17);

	var node_18 = $.sibling(node_17, 2);

	size(node_18);

	var node_19 = $.sibling(node_18, 2);

	withErrorProp(node_19);

	var node_20 = $.sibling(node_19, 2);

	prevAndNext(node_20);
	$.append($$anchor, fragment_14);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">error</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Good error design is clear, useful, and friendly. Designing concise and accurate error
			messages unblocks users and builds trust by meeting people where they are.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1oztu9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Error';
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