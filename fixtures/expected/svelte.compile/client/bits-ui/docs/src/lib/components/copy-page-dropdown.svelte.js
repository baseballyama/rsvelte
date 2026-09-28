import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu } from "bits-ui";
import CaretDown from "phosphor-svelte/lib/CaretDown";
import OpenAiLogo from "phosphor-svelte/lib/OpenAiLogo";
import FileMd from "phosphor-svelte/lib/FileMd";
import { page } from "$app/state";
import Claude from "$icons/claude.svelte";

const LinkItem = ($$anchor, $$arg0) => {
	let href = () => ($$arg0?.()).href;
	let icon = () => ($$arg0?.()).icon;
	let label = () => ($$arg0?.()).label;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			const Icon = $.derived(icon);
			var a = root();

			$.attribute_effect(a, () => ({ href: href(), target: '_blank', ...props() }));

			var div = $.child(a);
			var node_1 = $.child(div);

			$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, { class: 'text-foreground-alt mr-2 size-5' });
			});

			var text = $.sibling(node_1);

			$.reset(div);
			$.reset(a);
			$.template_effect(() => $.set_text(text, ` ${label() ?? ''}`));
			$.append($$anchor, a);
		};

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, {
				class: 'rounded-button data-highlighted:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
				child,
				$$slots: { child: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<a><div class="flex items-center"><!> </div></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Copy_page_dropdown($$anchor, $$props) {
	$.push($$props, true);

	const q = $.derived(() => `The following is a documentation page from Bits UI (a headless component library for Svelte 5): https://bits-ui.com${page.url.pathname}. Be ready to help answer questions about this page.`);
	const path = $.derived(() => page.url.pathname.split("#")[0]);
	var fragment_1 = $.comment();
	var node_2 = $.first_child(fragment_1);

	$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						class: 'border-input text-foreground hover:bg-muted inline-flex size-8 select-none items-center justify-center rounded-r-md border text-sm font-medium active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							CaretDown($$anchor, { class: 'text-foreground size-4' });
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									class: 'border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--bits-dropdown-menu-content-available-height) origin-(--bits-dropdown-menu-content-transform-origin) z-50 w-[180px] rounded-xl border px-1 py-1.5',
									sideOffset: 8,
									align: 'end',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_6 = $.first_child(fragment_5);

										LinkItem(node_6, () => ({
											href: `https://bits-ui.com${$.get(path)}/llms.txt`,
											label: "View Markdown",
											icon: FileMd
										}));

										var node_7 = $.sibling(node_6, 2);

										{
											let $0 = $.derived(() => ({
												href: `https://chatgpt.com?q=${encodeURIComponent($.get(q))}`,
												label: "Open in ChatGPT",
												icon: OpenAiLogo
											}));

											LinkItem(node_7, () => $.get($0));
										}

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(() => ({
												href: `https://claude.ai/new?q=${encodeURIComponent($.get(q))}`,
												label: "Open in Claude",
												icon: Claude
											}));

											LinkItem(node_8, () => $.get($0));
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_1);
	$.pop();
}