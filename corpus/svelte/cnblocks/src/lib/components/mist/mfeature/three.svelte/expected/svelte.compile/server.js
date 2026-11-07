import * as $ from 'svelte/internal/server';
import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import { cn } from "$lib/utils";
import BoldIcon from "@lucide/svelte/icons/bold";
import Calendar1 from "@lucide/svelte/icons/calendar-1";
import Ellipsis from "@lucide/svelte/icons/ellipsis";
import Italic from "@lucide/svelte/icons/italic";
import Strikethrough from "@lucide/svelte/icons/strikethrough";
import Underline from "@lucide/svelte/icons/underline";

function ScheduleIllustation($$renderer, { _class = "", variant = "elevated" }) {
	$$renderer.push(`<div${$.attr_class($.clsx(cn("relative", _class)))}><div${$.attr_class($.clsx(cn("absolute flex -translate-x-1/8 -translate-y-[110%] items-center gap-2 rounded-lg bg-background p-1", {
		"shadow-black-950/10 shadow-lg": variant === "elevated",
		"border border-foreground/10": variant === "outlined",
		"border border-foreground/10 shadow-md shadow-black/5": variant === "mixed"
	})))}>`);

	Button($$renderer, {
		variant: 'mdefault',
		size: 'sm',
		class: 'rounded-sm',
		children: ($$renderer) => {
			Calendar1($$renderer, { class: 'size-3' });
			$$renderer.push(`<!----> <span class="text-sm font-medium">Schedule</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="block h-4 w-px bg-border"></span> `);

	ToggleGroup($$renderer, {
		type: 'multiple',
		size: 'sm',
		class: 'gap-0.5 *:rounded-md',
		children: ($$renderer) => {
			ToggleGroupItem($$renderer, {
				value: 'bold',
				'aria-label': 'Toggle bold',
				children: ($$renderer) => {
					BoldIcon($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleGroupItem($$renderer, {
				value: 'italic',
				'aria-label': 'Toggle italic',
				children: ($$renderer) => {
					Italic($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleGroupItem($$renderer, {
				value: 'underline',
				'aria-label': 'Toggle underline',
				children: ($$renderer) => {
					Underline($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleGroupItem($$renderer, {
				value: 'strikethrough',
				'aria-label': 'Toggle strikethrough',
				children: ($$renderer) => {
					Strikethrough($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="block h-4 w-px bg-border"></span> `);

	Button($$renderer, {
		size: 'icon',
		class: 'size-8',
		variant: 'ghost',
		children: ($$renderer) => {
			Ellipsis($$renderer, { class: 'size-3' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <span><span class="bg-secondary py-1 text-sm text-secondary-foreground dark:bg-secondary/10">Tomorrow 8:30 pm</span> is our priority.</span></div>`);
}

function CodeIllustration($$renderer, { _class = "" }) {
	$$renderer.push(`<div${$.attr_class($.clsx(cn("[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)]", _class)))}><ul class="mx-auto w-fit font-mono text-2xl font-medium text-muted-foreground"><!--[-->`);

	const each_array = $.ensure_array_like(["Images", "Variables", "Pages", "Components", "Styles"]);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let item = each_array[index];

		$$renderer.push(`<li${$.attr_class($.clsx(cn(index == 2 && "text-foreground before:absolute before:-translate-x-[110%] before:text-orange-500 before:content-['Import']")))}>${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]--></ul></div>`);
}

export default function Three($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)] dark:[--color-primary:theme(color.indigo.400)] dark:[--color-secondary-foreground:theme(color.indigo.500)] dark:[--color-secondary:theme(color.indigo.400)]"><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><div><h2 class="mt-4 text-4xl font-semibold text-foreground">Personal AI, with you Anywhere</h2> <p class="mt-4 mb-12 text-lg text-balance text-muted-foreground">Quick AI lives a single hotkey away - ready to quickly appear as a floating
					window above your other apps. Get instant assistance whether you're browsing,
					coding, or writing documents.</p></div> <div class="grid gap-4 sm:grid-cols-2">`);

		Card($$renderer, {
			variant: 'soft',
			class: 'p-6',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex aspect-video items-center justify-center">`);
				CodeIllustration($$renderer, { _class: "w-full" });
				$$renderer.push(`<!----></div> <div class="text-center"><h3 class="text-xl font-semibold text-foreground">Marketing Campaigns</h3> <p class="mt-4 text-lg text-balance text-muted-foreground">Effortlessly plan and execute your marketing campaigns organized.</p></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Card($$renderer, {
			variant: 'soft',
			class: 'p-6',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex aspect-video items-center justify-center">`);
				ScheduleIllustation($$renderer, { _class: "border" });

				$$renderer.push(`<!----></div> <div class="text-center"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="mt-4 text-lg text-balance text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></section>`);
	});
}