import * as $ from 'svelte/internal/server';
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

export default function Copy_markdown_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CONTENT_BASE_URL = 'https://github.com/ieedan/shadcn-svelte-extras/tree/main/content/';
		const docs = useDocs();
		const markdownViewHref = $.derived(() => new URL(`/docs/${docs.doc.doc.slug}.md`, page.url.origin).href);
		const shareQuery = $.derived(() => `Read ${markdownViewHref()} I want to ask questions about it.`);
		const source = $.derived(() => `${CONTENT_BASE_URL.replace(/\/$/, '')}/${docs.doc.doc.path}.md`);

		const chatItems = $.derived(() => [
			{
				title: 'Open in ChatGPT',
				href: `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', q: shareQuery() })}`,
				icon: OpenaiLogo
			},

			{
				title: 'Open in Claude',
				href: `https://claude.ai/new?${new URLSearchParams({ q: shareQuery() })}`,
				icon: AnthropicLogo
			},

			{
				title: 'Open in T3 Chat',
				href: `https://t3.chat/new?${new URLSearchParams({ q: shareQuery() })}`,
				icon: MessageCircleIcon
			},

			{
				title: 'Open in Finalchat',
				href: `https://finalchat.app/chat?${new URLSearchParams({ q: shareQuery() })}`,
				icon: FinalchatLogo
			}
		]);

		const clipboard = new UseClipboard({ delay: 1000 });

		$$renderer.push(`<div class="flex items-center gap-0"><button type="button"${$.attr_class($.clsx(cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-2 rounded-r-none md:text-[0.8rem]')))}>`);

		if (clipboard.copied) {
			$$renderer.push(`<!--[0--><div>`);
			CheckIcon($$renderer, { tabindex: -1 });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div>`);
			LinkIcon($$renderer, { tabindex: -1 });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> Copy Link</button> `);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: cn(buttonVariants({ variant: 'secondary', size: 'icon-sm' }), 'rounded-l-none border-l-0'),
							children: ($$renderer) => {
								ChevronDownIcon($$renderer, { class: 'size-4' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							align: 'end',
							class: 'min-w-[12rem]',
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										$$renderer.push(`<a${$.attributes({
											...props,
											href: markdownViewHref(),
											target: '_blank',
											rel: 'noopener noreferrer'
										})}>`);

										MarkdownLogo($$renderer, { class: 'text-muted-foreground size-4 shrink-0' });
										$$renderer.push(`<!----> View as Markdown</a>`);
									}

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (DropdownMenu.Separator) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(chatItems());

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									{
										function child($$renderer, { props }) {
											$$renderer.push(`<a${$.attributes({
												...props,
												href: item.href,
												target: '_blank',
												rel: 'noopener noreferrer'
											})}>`);

											if (item.icon) {
												$$renderer.push('<!--[-->');
												item.icon($$renderer, { class: 'text-muted-foreground size-4 shrink-0' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` ${$.escape(item.title)}</a>`);
										}

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								}

								$$renderer.push(`<!--]--> `);

								if (DropdownMenu.Separator) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								{
									function child($$renderer, { props }) {
										$$renderer.push(`<a${$.attributes({
											...props,
											href: source(),
											target: '_blank',
											rel: 'noopener noreferrer'
										})}>`);

										GithubLogo($$renderer, { class: 'text-muted-foreground size-4 shrink-0' });
										$$renderer.push(`<!----> Open in GitHub</a>`);
									}

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}