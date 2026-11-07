import * as $ from 'svelte/internal/server';
import { Label } from '$lib/components/ui/label';
import { Avatar } from '$lib/components/ui/avatar';
import { Button } from '$lib/components/ui/button';
import Modal from '$lib/components/common/modal.svelte';
import { date } from '$lib/core/utils';
import { OrderTimelineRenderer } from '$lib/core/composables/index.js';

export default function Order_timeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { timeline } = $$props;

		{
			function content(
				$$renderer,
				{
					comments,
					systemGeneratedMessages,
					showEmailPreviewFromTimeline,
					selectedEmailFromTimeline,
					showEmailPreview,
					hideEmailPreview
				}
			) {
				$$renderer.push(`<div class="flex flex-col">`);

				Label($$renderer, {
					class: 'mb-3 text-sm font-semibold sm:text-base',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Timeline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><div class="relative"><div class="absolute bottom-0 left-[17px] top-0 w-[2px] bg-muted"></div> <div class="space-y-4 sm:space-y-6"><!--[-->`);

				const each_array = $.ensure_array_like([...comments, ...systemGeneratedMessages]);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.push(`<div class="relative pl-8 sm:pl-10"><div class="absolute left-[18px] top-2 box-content h-[9px] w-[9px] -translate-x-[50%] rounded-full border-[3px] border-white bg-[#515151]"></div> `);

					if ('avatar' in item) {
						$$renderer.push(`<!--[0--><div class="mb-2 rounded-lg border bg-card p-3 shadow-sm sm:p-4"><div class="flex items-start gap-2 sm:gap-3">`);

						Avatar($$renderer, {
							class: 'flex h-8 w-8 items-center justify-center bg-gray-200 text-black sm:h-12 sm:w-12',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-base sm:text-lg">${$.escape(item.avatar)}</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="min-w-0 flex-1"><div class="text-sm font-medium sm:text-base">${$.escape(item.author)}</div> <div class="break-words text-xs text-muted-foreground sm:text-sm">${$.html(item.content)}</div></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="group flex flex-col gap-1 sm:flex-row sm:gap-0"><div class="min-w-0 flex-1"><p class="whitespace-pre-line break-words text-xs text-gray-700 sm:text-sm">${$.html(item.message)}</p> `);

						if (item.comment) {
							$$renderer.push(`<!--[0--><div class="break-words text-xs text-muted-foreground sm:text-sm">${$.html(item.comment)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (item.action) {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								variant: 'secondary',
								size: 'sm',
								class: 'mt-2 text-xs sm:text-sm',
								onclick: item.action.onClick,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(item.action.label)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="flex items-center text-xs text-muted-foreground sm:text-sm"><span>${$.escape(date(item.timestamp))}</span></div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div></div> `);

				Modal($$renderer, {
					loading: false,
					show: showEmailPreviewFromTimeline,
					title: 'Email Preview',
					hideFooter: true,
					close: hideEmailPreview,
					children: ($$renderer) => {
						$$renderer.push(`<div class="p-5">${$.html(selectedEmailFromTimeline)}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			OrderTimelineRenderer($$renderer, { timeline, content, $$slots: { content: true } });
		}
	});
}