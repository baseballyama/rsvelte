import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from '$lib/components/ui/label';
import { Avatar } from '$lib/components/ui/avatar';
import { Button } from '$lib/components/ui/button';
import Modal from '$lib/components/common/modal.svelte';
import { date } from '$lib/core/utils';
import { OrderTimelineRenderer } from '$lib/core/composables/index.js';

var root = $.from_html(`<span class="text-base sm:text-lg"> </span>`);
var root_1 = $.from_html(`<div class="mb-2 rounded-lg border bg-card p-3 shadow-sm sm:p-4"><div class="flex items-start gap-2 sm:gap-3"><!> <div class="min-w-0 flex-1"><div class="text-sm font-medium sm:text-base"> </div> <div class="break-words text-xs text-muted-foreground sm:text-sm"></div></div></div></div>`);
var root_2 = $.from_html(`<div class="break-words text-xs text-muted-foreground sm:text-sm"></div>`);
var root_3 = $.from_html(`<div class="group flex flex-col gap-1 sm:flex-row sm:gap-0"><div class="min-w-0 flex-1"><p class="whitespace-pre-line break-words text-xs text-gray-700 sm:text-sm"></p> <!> <!></div> <div class="flex items-center text-xs text-muted-foreground sm:text-sm"><span> </span></div></div>`);
var root_4 = $.from_html(`<div class="relative pl-8 sm:pl-10"><div class="absolute left-[18px] top-2 box-content h-[9px] w-[9px] -translate-x-[50%] rounded-full border-[3px] border-white bg-[#515151]"></div> <!></div>`);
var root_5 = $.from_html(`<div class="p-5"></div>`);
var root_6 = $.from_html(`<div class=" flex flex-col"><!> <div><div class="relative"><div class="absolute bottom-0 left-[17px] top-0 w-[2px] bg-muted"></div> <div class="space-y-4 sm:space-y-6"></div></div></div></div> <!>`, 1);

export default function Order_timeline($$anchor, $$props) {
	$.push($$props, true);

	{
		const content = ($$anchor, $$arg0) => {
			let comments = () => ($$arg0?.()).comments;
			let systemGeneratedMessages = () => ($$arg0?.()).systemGeneratedMessages;
			let showEmailPreviewFromTimeline = () => ($$arg0?.()).showEmailPreviewFromTimeline;
			let selectedEmailFromTimeline = () => ($$arg0?.()).selectedEmailFromTimeline;
			let showEmailPreview = () => ($$arg0?.()).showEmailPreview;
			let hideEmailPreview = () => ($$arg0?.()).hideEmailPreview;
			var fragment_1 = root_6();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Label(node, {
				class: 'mb-3 text-sm font-semibold sm:text-base',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Timeline');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.sibling($.child(div_2), 2);

			$.each(div_3, 21, () => [...comments(), ...systemGeneratedMessages()], $.index, ($$anchor, item) => {
				var div_4 = root_4();
				var node_1 = $.sibling($.child(div_4), 2);

				{
					var consequent = ($$anchor) => {
						var div_5 = root_1();
						var div_6 = $.child(div_5);
						var node_2 = $.child(div_6);

						Avatar(node_2, {
							class: 'flex h-8 w-8 items-center justify-center bg-gray-200 text-black sm:h-12 sm:w-12',
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var text_1 = $.only_child(span, true);

								$.template_effect(() => $.set_text(text_1, $.get(item).avatar));
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});

						var div_7 = $.sibling(node_2, 2);
						var div_8 = $.child(div_7);
						var text_2 = $.only_child(div_8, true);
						var div_9 = $.sibling(div_8, 2);

						$.html(div_9, () => $.get(item).content, true);
						$.reset(div_9);
						$.reset(div_7);
						$.reset(div_6);
						$.reset(div_5);
						$.template_effect(() => $.set_text(text_2, $.get(item).author));
						$.append($$anchor, div_5);
					};

					var alternate = ($$anchor) => {
						var div_10 = root_3();
						var div_11 = $.child(div_10);
						var p = $.child(div_11);

						$.html(p, () => $.get(item).message, true);
						$.reset(p);

						var node_3 = $.sibling(p, 2);

						{
							var consequent_1 = ($$anchor) => {
								var div_12 = root_2();

								$.html(div_12, () => $.get(item).comment, true);
								$.reset(div_12);
								$.append($$anchor, div_12);
							};

							$.if(node_3, ($$render) => {
								if ($.get(item).comment) $$render(consequent_1);
							});
						}

						var node_4 = $.sibling(node_3, 2);

						{
							var consequent_2 = ($$anchor) => {
								Button($$anchor, {
									variant: 'secondary',
									size: 'sm',
									class: 'mt-2 text-xs sm:text-sm',
									get onclick() {
										return $.get(item).action.onClick;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, $.get(item).action.label));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_4, ($$render) => {
								if ($.get(item).action) $$render(consequent_2);
							});
						}

						$.reset(div_11);

						var div_13 = $.sibling(div_11, 2);
						var span_1 = $.child(div_13);
						var text_4 = $.only_child(span_1, true);

						$.reset(div_13);
						$.reset(div_10);
						$.template_effect(($0) => $.set_text(text_4, $0), [() => date($.get(item).timestamp)]);
						$.append($$anchor, div_10);
					};

					$.if(node_1, ($$render) => {
						if ('avatar' in $.get(item)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var node_5 = $.sibling(div, 2);

			Modal(node_5, {
				loading: false,
				get show() {
					return showEmailPreviewFromTimeline();
				},
				title: 'Email Preview',
				hideFooter: true,
				get close() {
					return hideEmailPreview();
				},

				children: ($$anchor, $$slotProps) => {
					var div_14 = root_5();

					$.html(div_14, selectedEmailFromTimeline, true);
					$.reset(div_14);
					$.append($$anchor, div_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		OrderTimelineRenderer($$anchor, {
			get timeline() {
				return $$props.timeline;
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}