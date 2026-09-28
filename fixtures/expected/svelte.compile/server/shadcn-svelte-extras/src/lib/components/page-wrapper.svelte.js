import * as $ from 'svelte/internal/server';
import { Badge } from '$lib/components/ui/badge';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import CodeIcon from '@lucide/svelte/icons/code';
import * as Navigation from '$lib/components/ui/prev-next';
import { UseToc } from '$lib/hooks/use-toc.svelte';
import * as Toc from '$lib/components/ui/toc';
import Button from '$lib/components/button.svelte';
import * as Tooltip from './ui/tooltip';
import CarbonAds from './carbon-ads.svelte';
import CopyMarkdownButton from './copy-markdown-button.svelte';
import { useDocs } from '$lib/features/docs/docs-context.svelte';

export default function Page_wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const toc = new UseToc();
		const docsState = useDocs();

		$$renderer.push(`<div class="relative flex w-full justify-center gap-4 px-6 py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]"><div class="mx-auto w-full max-w-4xl min-w-0" style="min-height: calc(100dvh - var(--header-height) - 4rem);"><div class="flex flex-col"><div class="mb-5 flex flex-col gap-1"><div class="flex items-center justify-between gap-2"><h1 class="text-4xl font-bold">${$.escape(docsState.doc.doc.title)}</h1> <div class="hidden items-center gap-2 md:flex">`);
		CopyMarkdownButton($$renderer, {});
		$$renderer.push(`<!----> `);

		if (docsState.doc.prev) {
			$$renderer.push('<!--[0-->');

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'secondary',
										size: 'icon',
										class: 'size-8',
										href: docsState.doc.prev?.href,
										'data-umami-event': 'Navigate backward arrow',
										children: ($$renderer) => {
											ArrowLeftIcon($$renderer, { class: 'size-4' });
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');
								Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(docsState.doc.prev.title)}`);
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (docsState.doc.next) {
			$$renderer.push('<!--[0-->');

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'secondary',
										size: 'icon',
										class: 'size-8',
										href: docsState.doc.next?.href,
										'data-umami-event': 'Navigate forward arrow',
										children: ($$renderer) => {
											ArrowRightIcon($$renderer, { class: 'size-4' });
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');
								Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(docsState.doc.next.title)}`);
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <p class="text-muted-foreground! text-lg">${$.escape(docsState.doc.doc.description)}</p> <div class="flex flex-wrap place-items-center gap-1">`);

		if (docsState.doc.doc.links?.source) {
			$$renderer.push('<!--[0-->');

			Badge($$renderer, {
				href: docsState.doc.doc.links?.source,
				variant: 'secondary',
				target: '_blank',
				class: 'flex w-fit place-items-center gap-1 rounded-md',
				children: ($$renderer) => {
					$$renderer.push(`<span class="font-semibold">Component Source</span> `);
					CodeIcon($$renderer, { class: 'size-3.5' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div style="display: contents;" class="page-wrapper">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div> `);

		{
			function previous($$renderer) {
				if (docsState.doc.prev) {
					$$renderer.push('<!--[0-->');

					if (Navigation.Previous) {
						$$renderer.push('<!--[-->');

						Navigation.Previous($$renderer, {
							href: docsState.doc.prev.href,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(docsState.doc.prev.title)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function next($$renderer) {
				if (docsState.doc.next) {
					$$renderer.push('<!--[0-->');

					if (Navigation.Next) {
						$$renderer.push('<!--[-->');

						Navigation.Next($$renderer, {
							href: docsState.doc.next.href,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(docsState.doc.next.title)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			if (Navigation.Root) {
				$$renderer.push('<!--[-->');

				Navigation.Root($$renderer, {
					class: 'pt-10',
					previous,
					next,
					$$slots: { previous: true, next: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`</div> <div class="hidden xl:block"><div class="sticky top-[calc(var(--header-height)+2rem)] h-[calc(100vh-var(--header-height)-4rem)]"><div class="no-scrollbar h-full pb-10"><div class="space-y-2"><span class="text-foreground text-sm font-medium">On This Page</span> `);

		if (Toc.Root) {
			$$renderer.push('<!--[-->');
			Toc.Root($$renderer, { toc: toc.current });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		CarbonAds($$renderer, {});
		$$renderer.push(`<!----></div></div></div></div></div>`);
	});
}