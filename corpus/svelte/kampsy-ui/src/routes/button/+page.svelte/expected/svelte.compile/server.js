import * as $ from 'svelte/internal/server';
import { ArrowLeft, ArrowRight } from "$lib/icons/index.js";
import { Button } from "$lib/index.js";
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

import {
	buttonDisabled,
	buttonLoading,
	buttonPrefixAndSuffix,
	buttonRounded,
	buttonShapes,
	buttonSize,
	buttonVariants,
	buttonDisabledVariants
} from "../../docs/data/button.js";

import Pagination from "$lib/pagination/pagination.svelte";
import ArrowUp from "$lib/icons/arrow-up.svelte";

function button($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">button</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Trigger an action or event, such as submitting a form or displaying a dialog.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex flex-initial flex-col items-start gap-4 md:flex-row">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> `);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div>`);
}

function size($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					size: 'tiny',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The default size is medium.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonSize);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function types($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-6"><div class="flex items-center gap-3">`);

				Button($$renderer, {
					size: 'small',
					variant: 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					variant: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					variant: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					variant: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					variant: 'tertiary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-3">`);

				Button($$renderer, {
					variant: 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'tertiary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-3">`);

				Button($$renderer, {
					size: 'large',
					variant: 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					variant: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					variant: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					variant: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					variant: 'tertiary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/button#all-types-and-sizes-in-comparison',
				children: ($$renderer) => {
					$$renderer.push(`<!---->All Types and Sizes in comparison`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonVariants);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function shapes($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'square',
					size: 'tiny',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'square',
					size: 'small',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'square',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'square',
					size: 'large',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'circle',
					size: 'tiny',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'circle',
					size: 'small',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'circle',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					'aria-label': 'Upload',
					shape: 'circle',
					size: 'large',
					svgOnly: true,
					children: ($$renderer) => {
						ArrowUp($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#shapes',
				children: ($$renderer) => {
					$$renderer.push(`<!---->shapes`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Icon-only buttons should include the `);
			roundedCode($$renderer, "svgOnly");
			$$renderer.push(`<!----> prop and an `);
			roundedCode($$renderer, "aria-label");
			$$renderer.push(`<!---->.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonShapes);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prefixAndSuffix($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				{
					function prefix($$renderer) {
						ArrowLeft($$renderer, {});
					}

					Button($$renderer, {
						prefix,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Upload`);
						},
						$$slots: { prefix: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function suffix($$renderer) {
						ArrowRight($$renderer, {});
					}

					Button($$renderer, {
						suffix,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Upload`);
						},
						$$slots: { suffix: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function prefix($$renderer) {
						ArrowLeft($$renderer, {});
					}

					function suffix($$renderer) {
						ArrowRight($$renderer, {});
					}

					Button($$renderer, {
						prefix,
						suffix,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Upload`);
						},
						$$slots: { prefix: true, suffix: true, default: true }
					});
				}

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#prefix-and-suffix',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Prefix and Suffix`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonPrefixAndSuffix);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function rounded($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					size: 'small',
					variant: 'secondary',
					shape: 'rounded',
					shadow: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'secondary',
					shape: 'rounded',
					shadow: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					variant: 'secondary',
					shape: 'rounded',
					shadow: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#rounded',
				children: ($$renderer) => {
					$$renderer.push(`<!---->rounded`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Combination of `);
			roundedCode($$renderer, 'shape="rounded"');
			$$renderer.push(`<!----> and the `);
			roundedCode($$renderer, "shadow");
			$$renderer.push(`<!----> prop, often used on marketing pages.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonRounded);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function loading($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					size: 'small',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'large',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#loading',
				'aria-label': 'loading',
				children: ($$renderer) => {
					$$renderer.push(`<!---->loading`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonLoading);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function disabled($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					disabled: true,
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					size: 'large',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Upload`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#disabled',
				'aria-label': 'Disabled',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonDisabled);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function disabledVariants($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Button($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					variant: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Secondary`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					variant: 'tertiary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Tertiary`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					variant: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Error`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: true,
					variant: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Warning`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/button#disabled-variants',
				'aria-label': 'Disabled variants',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled variants`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, buttonDisabledVariants);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function bestPractices($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Best Practices</h2> <div class="mt-4"><ul class="mt-4 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use `);
			roundedCode($$renderer, "Button");

			$$renderer.push(`<!----> for actions that mutate state (deploy, save, delete);
					use `);

			roundedCode($$renderer, "ButtonLink");

			$$renderer.push(`<!----> for navigation that changes the URL. Switch to
					a <a href="/menu" class="underline">Menu</a> or <a href="/split-button" class="underline">Split Button</a> when more than one related action
					shares a row.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Default `);

			roundedCode($$renderer, "Button");
			$$renderer.push(`<!----> is the primary style. Pass `);
			roundedCode($$renderer, 'variant="secondary"');
			$$renderer.push(`<!----> for the supporting action and `);
			roundedCode($$renderer, 'variant="error"');

			$$renderer.push(`<!----> for destructive
					confirmations. `);

			roundedCode($$renderer, "primary");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "success");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "ghost");
			$$renderer.push(`<!---->, and `);
			roundedCode($$renderer, "violet");
			$$renderer.push(`<!----> are not valid `);
			roundedCode($$renderer, "variant");
			$$renderer.push(`<!----> values.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">For form submits, use `);
			roundedCode($$renderer, 'type="submit"');
			$$renderer.push(`<!---->. The HTML `);
			roundedCode($$renderer, "type");
			$$renderer.push(`<!----> attribute controls the button behavior; the visual style lives on `);
			roundedCode($$renderer, "variant");
			$$renderer.push(`<!---->.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Pass `);
			roundedCode($$renderer, "loading");

			$$renderer.push(`<!----> instead of swapping in a spinner so the button stays
					focusable and announces the busy state to assistive tech.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Disable a button only when the action is impossible right now (missing input,
					insufficient permission); pair with a <a href="/tooltip" class="underline">Tooltip</a> that explains why.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Title Case the label and name what happens: `);

			roundedCode($$renderer, "Deploy Project");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Invite Member");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Rotate Key");
			$$renderer.push(`<!---->. Avoid bare verbs (`);
			roundedCode($$renderer, "Submit");
			$$renderer.push(`<!---->) and generic confirms (`);
			roundedCode($$renderer, "OK");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "Confirm");
			$$renderer.push(`<!---->).</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Destructive buttons follow `);
			roundedCode($$renderer, "Verb + Noun");

			$$renderer.push(`<!----> and pair 1:1 with their
					toast: `);

			roundedCode($$renderer, "Delete Project");
			$$renderer.push(`<!----> then `);
			roundedCode($$renderer, "Project deleted");
			$$renderer.push(`<!---->. Mode-switch buttons append `);
			roundedCode($$renderer, "Instead");
			$$renderer.push(`<!---->: `);
			roundedCode($$renderer, "Use a Recovery Code Instead");
			$$renderer.push(`<!---->.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Icon-only buttons require both `);
			roundedCode($$renderer, "svgOnly");
			$$renderer.push(`<!----> and `);
			roundedCode($$renderer, "aria-label");
			$$renderer.push(`<!---->; the component warns in development without them. The `);
			roundedCode($$renderer, "aria-label");
			$$renderer.push(`<!----> names the action and the target (`);
			roundedCode($$renderer, "Copy deployment URL");

			$$renderer.push(`<!---->),
					not the icon (`);

			roundedCode($$renderer, "Copy");
			$$renderer.push(`<!---->).</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Don't set `);
			roundedCode($$renderer, "aria-label");

			$$renderer.push(`<!----> on a button that already has visible text;
					it overrides the label and creates a screen-reader mismatch.</li></ul></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "badge", href: "/badge" },
				next: { title: "calendar", href: "/calendar" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	button($$renderer);
	$$renderer.push(`<!----> `);
	size($$renderer);
	$$renderer.push(`<!----> `);
	types($$renderer);
	$$renderer.push(`<!----> `);
	shapes($$renderer);
	$$renderer.push(`<!----> `);
	prefixAndSuffix($$renderer);
	$$renderer.push(`<!----> `);
	rounded($$renderer);
	$$renderer.push(`<!----> `);
	loading($$renderer);
	$$renderer.push(`<!----> `);
	disabled($$renderer);
	$$renderer.push(`<!----> `);
	disabledVariants($$renderer);
	$$renderer.push(`<!----> `);
	bestPractices($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('mccg8t', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Button</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}