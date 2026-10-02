import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Checkbox } from "$lib/index.js";
import { checkboxDefault, checkboxDisabled, checkboxIndeterminate } from "$lib/../docs/data/checkbox.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function checkbox($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Checkbox</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A control that toggles between two options, checked or unchecked.</p>`);
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

function disabledCheckbox($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex flex-initial flex-col items-stretch justify-start gap-4">`);

				Checkbox($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Disabled`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					checked: true,
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Disabled Checked`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					disabled: true,
					indeterminate: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Disabled Indeterminate`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/checkbox#disabled',
				'aria-label': 'disabled',
				children: ($$renderer) => {
					$$renderer.push(`<!---->disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, checkboxDisabled);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function indeterminate($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div>`);

				Checkbox($$renderer, {
					indeterminate: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Option 1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/checkbox#indeterminate',
				'aria-label': 'indeterminate',
				children: ($$renderer) => {
					$$renderer.push(`<!---->indeterminate`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, checkboxIndeterminate);
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
			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Best Practices</h2> <div class="mt-4"><h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">When to use</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use Checkbox for multi-select inside a list, like table-row pickers, multi-pick
					filters, and opt-in preference groups.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use it for acknowledgments where the user must affirm a specific statement, such as
					terms of service or an irreversible export.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">For a single boolean setting like dark mode or password protection, use <a href="/toggle" class="underline">Toggle</a>. The on/off mechanic is clearer there
					than a lone checkbox.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Behavior</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">`);

			roundedCode($$renderer, "indeterminate");

			$$renderer.push(`<!----> is a visual state, not a third value. Drive it from
					a parent that knows partial selection, and clear it as soon as every child is fully checked
					or unchecked.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Validation on a required acknowledgment fires on submit, not on blur, so checking and
					unchecking should not flash an error.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Disabled checkboxes still need a <a href="/tooltip" class="underline">Tooltip</a> naming the reason; a greyed box with no explanation reads as a bug.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Content</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Group label above a `);

			roundedCode($$renderer, "<fieldset>");
			$$renderer.push(`<!----> is a Title Case noun like `);
			roundedCode($$renderer, "Notifications");
			$$renderer.push(`<!----> or `);
			roundedCode($$renderer, "Required Permissions");
			$$renderer.push(`<!---->. No trailing colon.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Acknowledgment label is a full sentence ending in a period: `);
			roundedCode($$renderer, "I agree to the Terms of Service.");
			$$renderer.push(`<!----></li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Indeterminate copy names the partial count next to the group label (`);
			roundedCode($$renderer, "3 of 5 selected");
			$$renderer.push(`<!---->). Never leave the dash state unlabeled.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Accessibility</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Wrap related checkboxes in a `);
			roundedCode($$renderer, "<fieldset>");
			$$renderer.push(`<!----> with a `);
			roundedCode($$renderer, "<legend>");

			$$renderer.push(`<!----> so screen readers announce the group name before each
					option.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Row-select checkbox in a <a href="/table" class="underline">Table</a> has no visible
					label. Set `);

			roundedCode($$renderer, 'aria-label="Select {row name}"');

			$$renderer.push(`<!----> so the row stays identifiable
					out of context.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">The click target already extends to the label. Don’t override the `);

			roundedCode($$renderer, "<label>");
			$$renderer.push(`<!---->/`);
			roundedCode($$renderer, "htmlFor");

			$$renderer.push(`<!----> association with a custom
					wrapper that breaks the click region.</li></ul></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "calendar", href: "/calendar" },
				next: { title: "choicebox", href: "/choicebox" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let checked = false;

	function defaultCheckbox($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div>`);

					Checkbox($$renderer, {
						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Option 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				LinkH2($$renderer, {
					href: '/checkbox#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, checkboxDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		checkbox($$renderer);
		$$renderer.push(`<!----> `);
		defaultCheckbox($$renderer);
		$$renderer.push(`<!----> `);
		disabledCheckbox($$renderer);
		$$renderer.push(`<!----> `);
		indeterminate($$renderer);
		$$renderer.push(`<!----> `);
		bestPractices($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('1rm2qem', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Checkbox</title>`);
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