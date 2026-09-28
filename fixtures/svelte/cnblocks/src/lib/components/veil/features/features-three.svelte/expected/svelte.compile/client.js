import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Cloud from "@lucide/svelte/icons/cloud";
import Cpu from "@lucide/svelte/icons/cpu";
import Shield from "@lucide/svelte/icons/shield";
import { Button } from "$lib/components/ui/veil/button";
import { cn } from "$lib/utils";
import { Clerk, Firebase, Linear, Slack, Supabase, Vercel } from "$lib/svgs/index";

const IntegrationsIllustration = ($$anchor) => {
	var div = root();

	$.set_attribute(div, 'aria-hidden', true);

	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Vercel(node, { class: 'size-3.5' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Slack(node_1, { class: 'size-3.5' });
	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var node_2 = $.child(div_5);

	Clerk(node_2, { class: 'size-3.5' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.child(div_6);

	Linear(node_3, { class: 'size-3.5' });
	$.reset(div_6);
	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var node_4 = $.child(div_8);

	Supabase(node_4, { class: 'size-3.5' });
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_5 = $.child(div_9);

	Firebase(node_5, { class: 'size-3.5' });
	$.reset(div_9);
	$.reset(div_7);
	$.reset(div);
	$.append($$anchor, div);
};

const RealTimeIllustration = ($$anchor) => {
	var div_10 = root_1();

	$.set_attribute(div_10, 'aria-hidden', true);
	$.append($$anchor, div_10);
};

const EnterpriseIllustration = ($$anchor) => {
	var div_11 = root_2();

	$.set_attribute(div_11, 'aria-hidden', true);

	var node_6 = $.child(div_11);

	Shield(node_6, {
		class: 'absolute inset-0 size-full stroke-[0.1px] opacity-15'
	});

	var node_7 = $.sibling(node_6, 2);

	Shield(node_7, {
		class: 'size-32 fill-card stroke-border stroke-[0.2px] drop-shadow-xl drop-shadow-black/3 dark:fill-foreground/10'
	});

	$.reset(div_11);
	$.append($$anchor, div_11);
};

const DeveloperIllustration = ($$anchor) => {
	var div_12 = root_3();

	$.set_attribute(div_12, 'aria-hidden', true);
	$.append($$anchor, div_12);
};

var root = $.from_html(`<div class="flex h-44 flex-col justify-between pt-8 **:fill-foreground"><div class="relative flex h-10 items-center gap-12 px-6"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center justify-between gap-12 pr-6 pl-17"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center gap-20 px-8"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div></div>`);
var root_1 = $.from_html(`<div class="relative h-44 translate-y-6"><div class="absolute inset-0 mx-auto w-px bg-foreground/15"></div> <div class="absolute -inset-x-16 top-6 aspect-square rounded-full border"></div> <div class="absolute -inset-x-16 top-6 aspect-square rounded-full border border-primary mask-r-from-50% mask-r-to-50% mask-l-from-50% mask-l-to-90%"></div> <div class="absolute -inset-x-8 top-24 aspect-square rounded-full border"></div> <div class="absolute -inset-x-8 top-24 aspect-square rounded-full border border-lime-500 mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50%"></div></div>`);
var root_2 = $.from_html(`<div class="relative flex size-44 items-center justify-center"><!> <!></div>`);
var root_3 = $.from_html(`<div class="flex h-44 justify-between pt-12 pb-6 *:h-full *:w-px *:bg-foreground/15"><div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div></div>`);
var root_4 = $.from_html(`Get started <!>`, 1);
var root_5 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto grid max-w-3xl gap-6 px-6 @2xl:grid-cols-2"><div><div><h2 class="font-serif text-4xl font-medium text-balance">Powerful Features for Modern Teams</h2> <p class="mt-4 mb-6 text-balance text-muted-foreground">Everything you need to build, connect, and scale your integrations effortlessly.</p> <!></div> <div class="mt-16 *:w-full *:cursor-pointer"><button type="button" class="flex items-center gap-3 py-2 text-sm not-data-[selected=true]:text-muted-foreground not-data-[selected=true]:hover:text-foreground"><div class="flex size-4 items-center -space-x-2"><div class="size-3 shrink-0 rounded-full border border-current"></div> <div class="size-3 shrink-0 rounded-full border border-current"></div></div> <span class="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">Seamless Integrations</span></button> <button type="button" class="flex items-center gap-3 py-2 text-sm not-data-[selected=true]:text-muted-foreground not-data-[selected=true]:hover:text-foreground"><!> <span class="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">Real-time Sync</span></button> <button type="button" class="flex items-center gap-3 py-2 text-sm not-data-[selected=true]:text-muted-foreground not-data-[selected=true]:hover:text-foreground"><!> <span class="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">Developer-first</span></button> <button type="button" class="flex items-center gap-3 py-2 text-sm not-data-[selected=true]:text-muted-foreground not-data-[selected=true]:hover:text-foreground"><!> <span class="in-data-[selected=true]:text-shadow-[0.2px_0_0_currentColor]">Enterprise-ready</span></button></div></div> <div class="relative flex items-center overflow-hidden rounded-3xl *:w-full not-dark:bg-linear-to-b not-dark:via-muted @max-xl:-mx-6"><div><div></div> <div></div> <div></div> <div></div></div> <!></div></div></section>`);

export default function Features_three($$anchor, $$props) {
	$.push($$props, true);

	let feature = $.state("seamless-integrations");
	var section = root_5();
	var div_13 = $.child(section);
	var div_14 = $.child(div_13);
	var div_15 = $.child(div_14);
	var node_8 = $.sibling($.child(div_15), 4);

	Button(node_8, {
		href: '/',
		variant: 'secondary',
		size: 'sm',
		class: 'gap-1 pr-1.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root_4();
			var node_9 = $.sibling($.first_child(fragment));

			ChevronRight(node_9, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var button = $.child(div_16);
	var button_1 = $.sibling(button, 2);
	var node_10 = $.child(button_1);

	Cloud(node_10, { class: 'size-4' });
	$.next(2);
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var node_11 = $.child(button_2);

	Cpu(node_11, { class: 'size-4' });
	$.next(2);
	$.reset(button_2);

	var button_3 = $.sibling(button_2, 2);
	var node_12 = $.child(button_3);

	Shield(node_12, { class: 'size-4' });
	$.next(2);
	$.reset(button_3);
	$.reset(div_16);
	$.reset(div_14);

	var div_17 = $.sibling(div_14, 2);
	var div_18 = $.child(div_17);

	$.set_attribute(div_18, 'aria-hidden', true);

	var node_13 = $.sibling(div_18, 2);

	{
		var consequent = ($$anchor) => {
			IntegrationsIllustration($$anchor);
		};

		var consequent_1 = ($$anchor) => {
			RealTimeIllustration($$anchor);
		};

		var consequent_2 = ($$anchor) => {
			DeveloperIllustration($$anchor);
		};

		var alternate = ($$anchor) => {
			EnterpriseIllustration($$anchor);
		};

		$.if(node_13, ($$render) => {
			if ($.get(feature) === "seamless-integrations") $$render(consequent); else if ($.get(feature) === "real-time-sync") $$render(consequent_1, 1); else if ($.get(feature) === "developer-first") $$render(consequent_2, 2); else $$render(alternate, -1);
		});
	}

	$.reset(div_17);
	$.reset(div_13);
	$.reset(section);

	$.template_effect(
		($0) => {
			$.set_attribute(button, 'data-selected', $.get(feature) === "seamless-integrations");
			$.set_attribute(button_1, 'data-selected', $.get(feature) === "real-time-sync");
			$.set_attribute(button_2, 'data-selected', $.get(feature) === "developer-first");
			$.set_attribute(button_3, 'data-selected', $.get(feature) === "enterprise-ready");
			$.set_class(div_18, 1, $0);
		},
		[
			() => $.clsx(cn("absolute inset-0 grid grid-cols-4 mask-y-from-65% duration-300 *:bg-linear-to-r *:to-muted not-dark:opacity-50 dark:*:to-foreground/2", $.get(feature) === "seamless-integrations" && "grid-cols-1 grid-rows-12 *:bg-linear-to-t", $.get(feature) === "developer-first" && "grid-cols-2 *:bg-linear-to-l dark:opacity-50", $.get(feature) === "real-time-sync" && "*:opacity-35"))
		]
	);

	$.delegated('click', button, () => $.set(feature, "seamless-integrations"));
	$.delegated('click', button_1, () => $.set(feature, "real-time-sync"));
	$.delegated('click', button_2, () => $.set(feature, "developer-first"));
	$.delegated('click', button_3, () => $.set(feature, "enterprise-ready"));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);