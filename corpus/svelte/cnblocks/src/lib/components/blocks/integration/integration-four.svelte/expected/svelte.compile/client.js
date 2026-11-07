import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IntegrationCardv4 from "./card/integration-cardv4.svelte";
import { Gemini, GooglePaLM, MagicUI, VSCodium, Replit, MediaWiki } from "../logos/logos";
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg>`);
var root_1 = $.from_html(`<section><div class="bg-muted py-24 md:py-32 dark:bg-background"><div class="mx-auto max-w-5xl px-6"><div class="relative mx-auto flex max-w-sm items-center justify-between"><div class="space-y-6"><!> <!> <!></div> <div class="mx-auto my-2 flex w-fit justify-center gap-2"><div class="relative z-20 rounded-2xl border bg-muted p-1"><!></div></div> <div role="presentation" class="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[16px_16px] opacity-50 [--dots-color:black] dark:[--dots-color:white]"></div> <div class="space-y-6"><!> <!> <!></div></div> <div class="mx-auto mt-12 max-w-lg space-y-6 text-center"><h2 class="text-3xl font-semibold text-balance md:text-4xl">Integrate with your favorite tools</h2> <p class="text-muted-foreground">Connect seamlessly with popular platforms and services to enhance your workflow.</p> <!></div></div></div></section>`);

export default function Integration_four($$anchor) {
	var // Scroll below for the IntegrationCardv4 component code
	section = root_1();

	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	IntegrationCardv4(node, {
		position: 'left-top',
		children: ($$anchor, $$slotProps) => {
			Gemini($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	IntegrationCardv4(node_1, {
		position: 'left-middle',
		children: ($$anchor, $$slotProps) => {
			Replit($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	IntegrationCardv4(node_2, {
		position: 'left-bottom',
		children: ($$anchor, $$slotProps) => {
			MagicUI($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var node_3 = $.child(div_5);

	IntegrationCardv4(node_3, {
		class: 'shadow-black-950/10 size-16 border-black/25 shadow-xl dark:border-white/25 dark:bg-background dark:shadow-white/10',
		isCenter: true,
		children: ($$anchor, $$slotProps) => {
			var svg = root();

			$.append($$anchor, svg);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 4);
	var node_4 = $.child(div_6);

	IntegrationCardv4(node_4, {
		position: 'right-top',
		children: ($$anchor, $$slotProps) => {
			VSCodium($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	IntegrationCardv4(node_5, {
		position: 'right-middle',
		children: ($$anchor, $$slotProps) => {
			MediaWiki($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	IntegrationCardv4(node_6, {
		position: 'right-bottom',
		children: ($$anchor, $$slotProps) => {
			GooglePaLM($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var node_7 = $.sibling($.child(div_7), 4);

	Button(node_7, {
		variant: 'outline',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}