import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";
import Calendar from "@lucide/svelte/icons/calendar";
import MapIcon from "@lucide/svelte/icons/map";
import FeatureCard from "$lib/components/blocks/feature/feature-card.svelte";
import * as Card from "$lib/components/ui/card/index.js";

function cardHeading($$renderer, { icon: Icon, title, description }) {
	$$renderer.push(`<div class="p-6"><span class="flex items-center gap-2 text-muted-foreground">`);

	if (Icon) {
		$$renderer.push('<!--[-->');
		Icon($$renderer, { class: 'size-4' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` ${$.escape(title)}</span> <p class="mt-8 text-2xl font-semibold">${$.escape(description)}</p></div>`);
}

function dualModeImg(
	$$renderer,
	{ darkSrc, lightSrc, alt, width, height, _class }
) {
	$$renderer.push(`<img${$.attr('src', darkSrc)}${$.attr_class($.clsx(cn("hidden dark:block", _class)))}${$.attr('alt', `${alt} dark`)}${$.attr('width', width)}${$.attr('height', height)}/> <img${$.attr('src', lightSrc)}${$.attr_class($.clsx(cn("shadow dark:hidden", _class)))}${$.attr('alt', `${alt} light`)}${$.attr('width', width)}${$.attr('height', height)}/>`);
}

function circularUI($$renderer, { label, circles, _class }) {
	$$renderer.push(`<div${$.attr_class($.clsx(_class))}><div class="size-fit rounded-2xl bg-linear-to-b from-border to-transparent p-px"><div class="relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] bg-linear-to-b from-background to-muted/25 p-4"><!--[-->`);

	const each_array = $.ensure_array_like(circles);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let circle = each_array[i];

		$$renderer.push(`<div${$.attr_class($.clsx(cn("size-7 rounded-full border sm:size-8", {
			"border-primary": circle.pattern === "none",
			"border-primary bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_4px)]": circle.pattern === "border",
			"border-primary bg-background bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_4px)]": circle.pattern === "primary",
			"z-1 border-blue-500 bg-background bg-[repeating-linear-gradient(-45deg,var(--color-blue-500),var(--color-blue-500)_1px,transparent_1px,transparent_4px)]": circle.pattern === "blue"
		})))}></div>`);
	}

	$$renderer.push(`<!--]--></div></div> <span class="mt-1.5 block text-center text-sm text-muted-foreground">${$.escape(label)}</span></div>`);
}

export default function FeatureSectionTwo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"><div class="mx-auto max-w-2xl px-6 lg:max-w-5xl"><div class="mx-auto grid gap-4 lg:grid-cols-2">`);

		FeatureCard($$renderer, {
			class: 'relative',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						class: 'pb-3',
						children: ($$renderer) => {
							cardHeading($$renderer, {
								icon: MapIcon,
								title: "Real time location tracking",
								description: "Advanced tracking system, Instantly locate all your assets."
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <div class="mb-6 border-t border-dashed sm:mb-0"><div class="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-white)_100%)]"></div> <div class="aspect-76/59 p-1 px-6">`);

				dualModeImg($$renderer, {
					darkSrc: "/payments.png",
					lightSrc: "/payments-light.png",
					alt: "payments illustration",
					width: 1207,
					height: 929
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FeatureCard($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						class: 'pb-3',
						children: ($$renderer) => {
							cardHeading($$renderer, {
								icon: Calendar,
								title: "Advanced Scheduling",
								description: "Scheduling system, Instantly locate all your assets."
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="relative mb-6 overflow-hidden sm:mb-0"><div class="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--color-background)_100%)]"></div> <div class="aspect-76/59 border">`);

							dualModeImg($$renderer, {
								darkSrc: "/origin-cal-dark.png",
								lightSrc: "/origin-cal.png",
								alt: "calendar illustration",
								width: 1207,
								height: 929
							});

							$$renderer.push(`<!----></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FeatureCard($$renderer, {
			class: 'p-6 lg:col-span-2',
			children: ($$renderer) => {
				$$renderer.push(`<p class="mx-auto my-6 max-w-md text-center text-2xl font-semibold text-balance">Smart scheduling with automated reminders for maintenance.</p> <div class="flex justify-center gap-6 overflow-hidden">`);

				circularUI($$renderer, {
					label: "Union",
					circles: [{ pattern: "border" }, { pattern: "border" }],
					_class: ""
				});

				$$renderer.push(`<!----> `);

				circularUI($$renderer, {
					label: "Inclusion",
					circles: [{ pattern: "none" }, { pattern: "primary" }],
					_class: ""
				});

				$$renderer.push(`<!----> `);

				circularUI($$renderer, {
					label: "Join",
					circles: [{ pattern: "blue" }, { pattern: "none" }],
					_class: ""
				});

				$$renderer.push(`<!----> `);

				circularUI($$renderer, {
					label: "Exclusion",
					circles: [{ pattern: "primary" }, { pattern: "none" }],
					_class: "hidden sm:block"
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></section>`);
	});
}