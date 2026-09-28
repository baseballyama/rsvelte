import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Checkbox } from "$lib/index.js";
import { checkboxDefault, checkboxDisabled, checkboxIndeterminate } from "$lib/../docs/data/checkbox.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const checkbox = ($$anchor) => {
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

const disabledCheckbox = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_5 = $.first_child(fragment_5);

			LinkH2(node_5, {
				href: '/checkbox#disabled',
				'aria-label': 'disabled',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('disabled');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_6 = $.sibling(node_5, 2);

			{
				const demo = ($$anchor) => {
					var div_7 = root_4();
					var node_6 = $.child(div_7);

					Checkbox(node_6, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Disabled');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Checkbox(node_7, {
						checked: true,
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Disabled Checked');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Checkbox(node_8, {
						disabled: true,
						indeterminate: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Disabled Indeterminate');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var node_9 = $.child(div_6);

				demoAndCode(node_9, () => demo, () => checkboxDisabled);
				$.reset(div_6);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const indeterminate = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_3();
			var node_10 = $.first_child(fragment_7);

			LinkH2(node_10, {
				href: '/checkbox#indeterminate',
				'aria-label': 'indeterminate',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('indeterminate');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_10, 2);

			{
				const demo = ($$anchor) => {
					var div_9 = root_2();
					var node_11 = $.child(div_9);

					Checkbox(node_11, {
						indeterminate: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Option 1');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var node_12 = $.child(div_8);

				demoAndCode(node_12, () => demo, () => checkboxIndeterminate);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_5();
	var text_8 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_8, rct()));
	$.append($$anchor, code_1);
};

const bestPractices = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_6();
			var div_10 = $.sibling($.first_child(fragment_9), 2);
			var ul = $.sibling($.child(div_10), 6);
			var li = $.child(ul);
			var node_13 = $.child(li);

			roundedCode(node_13, () => "indeterminate");
			$.next();
			$.reset(li);
			$.next(4);
			$.reset(ul);

			var ul_1 = $.sibling(ul, 4);
			var li_1 = $.child(ul_1);
			var node_14 = $.sibling($.child(li_1));

			roundedCode(node_14, () => "<fieldset>");

			var node_15 = $.sibling(node_14, 2);

			roundedCode(node_15, () => "Notifications");

			var node_16 = $.sibling(node_15, 2);

			roundedCode(node_16, () => "Required Permissions");
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_17 = $.sibling($.child(li_2));

			roundedCode(node_17, () => "I agree to the Terms of Service.");
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_18 = $.sibling($.child(li_3));

			roundedCode(node_18, () => "3 of 5 selected");
			$.next();
			$.reset(li_3);
			$.reset(ul_1);

			var ul_2 = $.sibling(ul_1, 4);
			var li_4 = $.child(ul_2);
			var node_19 = $.sibling($.child(li_4));

			roundedCode(node_19, () => "<fieldset>");

			var node_20 = $.sibling(node_19, 2);

			roundedCode(node_20, () => "<legend>");
			$.next();
			$.reset(li_4);

			var li_5 = $.sibling(li_4, 2);
			var node_21 = $.sibling($.child(li_5), 3);

			roundedCode(node_21, () => 'aria-label="Select {row name}"');
			$.next();
			$.reset(li_5);

			var li_6 = $.sibling(li_5, 2);
			var node_22 = $.sibling($.child(li_6));

			roundedCode(node_22, () => "<label>");

			var node_23 = $.sibling(node_22, 2);

			roundedCode(node_23, () => "htmlFor");
			$.next();
			$.reset(li_6);
			$.reset(ul_2);
			$.reset(div_10);
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
				previous: { title: "calendar", href: "/calendar" },
				next: { title: "choicebox", href: "/choicebox" }
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

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Checkbox</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A control that toggles between two options, checked or unchecked.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="flex flex-initial flex-col items-stretch justify-start gap-4"><!> <!> <!></div>`);
var root_5 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);

var root_6 = $.from_html(
	`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Best Practices</h2> <div class="mt-4"><h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">When to use</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use Checkbox for multi-select inside a list, like table-row pickers, multi-pick
					filters, and opt-in preference groups.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use it for acknowledgments where the user must affirm a specific statement, such as
					terms of service or an irreversible export.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">For a single boolean setting like dark mode or password protection, use <a href="/toggle" class="underline">Toggle</a>. The on/off mechanic is clearer there
					than a lone checkbox.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Behavior</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal"><!> is a visual state, not a third value. Drive it from
					a parent that knows partial selection, and clear it as soon as every child is fully checked
					or unchecked.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Validation on a required acknowledgment fires on submit, not on blur, so checking and
					unchecking should not flash an error.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Disabled checkboxes still need a <a href="/tooltip" class="underline">Tooltip</a> naming the reason; a greyed box with no explanation reads as a bug.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Content</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Group label above a <!> is a Title Case noun like <!> or <!>. No trailing colon.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Acknowledgment label is a full sentence ending in a period: <!></li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Indeterminate copy names the partial count next to the group label (<!>). Never leave the dash state unlabeled.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Accessibility</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Wrap related checkboxes in a <!> with a <!> so screen readers announce the group name before each
					option.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Row-select checkbox in a <a href="/table" class="underline">Table</a> has no visible
					label. Set <!> so the row stays identifiable
					out of context.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">The click target already extends to the label. Don’t override the <!>/<!> association with a custom
					wrapper that breaks the click region.</li></ul></div>`,
	1
);

var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultCheckbox = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/checkbox#default',
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
						var div_5 = root_2();
						var node_3 = $.child(div_5);

						Checkbox(node_3, {
							get checked() {
								return $.get(checked);
							},

							set checked($$value) {
								$.set(checked, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Option 1');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					var node_4 = $.child(div_4);

					demoAndCode(node_4, () => demo, () => checkboxDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_12 = root_7();
		var node_24 = $.first_child(fragment_12);

		checkbox(node_24);

		var node_25 = $.sibling(node_24, 2);

		defaultCheckbox(node_25);

		var node_26 = $.sibling(node_25, 2);

		disabledCheckbox(node_26);

		var node_27 = $.sibling(node_26, 2);

		indeterminate(node_27);

		var node_28 = $.sibling(node_27, 2);

		bestPractices(node_28);

		var node_29 = $.sibling(node_28, 2);

		prevAndNext(node_29);
		$.append($$anchor, fragment_12);
	};

	let checked = $.state(false);

	$.head('1rm2qem', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Checkbox';
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