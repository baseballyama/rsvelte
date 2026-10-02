import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { buttonVariants } from '$lib/components/ui/button';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import { cn } from '$lib/utils';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { page } from '$app/state';
import { useDocs } from '$lib/features/docs/docs-context.svelte';
import GithubLogo from '$lib/components/logos/github.svelte';
import MarkdownLogo from '$lib/components/logos/markdown.svelte';
import OpenaiLogo from '$lib/components/logos/openai.svelte';
import AnthropicLogo from '$lib/components/logos/anthropic.svelte';
import FinalchatLogo from '$lib/components/logos/finalchat.svelte';
import LinkIcon from '@lucide/svelte/icons/link';
import CheckIcon from '@lucide/svelte/icons/check';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
import { scale } from 'svelte/transition';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<a><!> View as Markdown</a>`);
var root_2 = $.from_html(`<a><!> </a>`);
var root_3 = $.from_html(`<a><!> Open in GitHub</a>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center gap-0"><button type="button"><!> Copy Link</button> <!></div>`);

export default function Copy_markdown_button($$anchor, $$props) {
	$.push($$props, true);

	const CONTENT_BASE_URL = 'https://github.com/ieedan/shadcn-svelte-extras/tree/main/content/';
	const docs = useDocs();
	const markdownViewHref = $.derived(() => new URL(`/docs/${docs.doc.doc.slug}.md`, page.url.origin).href);
	const shareQuery = $.derived(() => `Read ${$.get(markdownViewHref)} I want to ask questions about it.`);
	const source = $.derived(() => `${CONTENT_BASE_URL.replace(/\/$/, '')}/${docs.doc.doc.path}.md`);

	const chatItems = $.derived(() => [
		{
			title: 'Open in ChatGPT',
			href: `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', q: $.get(shareQuery) })}`,
			icon: OpenaiLogo
		},

		{
			title: 'Open in Claude',
			href: `https://claude.ai/new?${new URLSearchParams({ q: $.get(shareQuery) })}`,
			icon: AnthropicLogo
		},

		{
			title: 'Open in T3 Chat',
			href: `https://t3.chat/new?${new URLSearchParams({ q: $.get(shareQuery) })}`,
			icon: MessageCircleIcon
		},

		{
			title: 'Open in Finalchat',
			href: `https://finalchat.app/chat?${new URLSearchParams({ q: $.get(shareQuery) })}`,
			icon: FinalchatLogo
		}
	]);

	const clipboard = new UseClipboard({ delay: 1000 });
	var div = root_6();
	var button = $.child(div);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			CheckIcon(node_1, { tabindex: -1 });
			$.reset(div_1);
			$.transition(1, div_1, () => scale, () => ({ duration: 500, start: 0.85 }));
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			LinkIcon(node_2, { tabindex: -1 });
			$.reset(div_2);
			$.transition(1, div_2, () => scale, () => ({ duration: 500, start: 0.85 }));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.next();
	$.reset(button);

	var node_3 = $.sibling(button, 2);

	$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_5();
				var node_4 = $.first_child(fragment);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: 'secondary', size: 'icon-sm' }), 'rounded-l-none border-l-0'));

					$.component(node_4, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								ChevronDownIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					});
				}

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						align: 'end',
						class: 'min-w-[12rem]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_6 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var a = root_1();

									$.attribute_effect(a, () => ({
										...props(),
										href: $.get(markdownViewHref),
										target: '_blank',
										rel: 'noopener noreferrer'
									}));

									var node_7 = $.child(a);

									MarkdownLogo(node_7, { class: 'text-muted-foreground size-4 shrink-0' });
									$.next();
									$.reset(a);
									$.append($$anchor, a);
								};

								$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_8 = $.sibling(node_6, 2);

							$.component(node_8, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_9 = $.sibling(node_8, 2);

							$.each(node_9, 17, () => $.get(chatItems), (item) => item.title, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_10 = $.first_child(fragment_3);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										var a_1 = root_2();

										$.attribute_effect(a_1, () => ({
											...props(),
											href: $.get(item).href,
											target: '_blank',
											rel: 'noopener noreferrer'
										}));

										var node_11 = $.child(a_1);

										$.component(node_11, () => $.get(item).icon, ($$anchor, item_icon) => {
											item_icon($$anchor, { class: 'text-muted-foreground size-4 shrink-0' });
										});

										var text = $.sibling(node_11);

										$.reset(a_1);
										$.template_effect(() => $.set_text(text, ` ${$.get(item).title ?? ''}`));
										$.append($$anchor, a_1);
									};

									$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
										DropdownMenu_Item_1($$anchor, { child, $$slots: { child: true } });
									});
								}

								$.append($$anchor, fragment_3);
							});

							var node_12 = $.sibling(node_9, 2);

							$.component(node_12, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
								DropdownMenu_Separator_1($$anchor, {});
							});

							var node_13 = $.sibling(node_12, 2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var a_2 = root_3();

									$.attribute_effect(a_2, () => ({
										...props(),
										href: $.get(source),
										target: '_blank',
										rel: 'noopener noreferrer'
									}));

									var node_14 = $.child(a_2);

									GithubLogo(node_14, { class: 'text-muted-foreground size-4 shrink-0' });
									$.next();
									$.reset(a_2);
									$.append($$anchor, a_2);
								};

								$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
									DropdownMenu_Item_2($$anchor, { child, $$slots: { child: true } });
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(button, 1, $0), [
		() => $.clsx(cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-2 rounded-r-none md:text-[0.8rem]'))
	]);

	$.delegated('click', button, () => clipboard.copy($.get(markdownViewHref)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);