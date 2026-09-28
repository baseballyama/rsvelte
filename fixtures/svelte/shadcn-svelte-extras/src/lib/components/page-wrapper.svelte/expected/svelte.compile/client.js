import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="font-semibold">Component Source</span> <!>`, 1);
var root_2 = $.from_html(`<div class="relative flex w-full justify-center gap-4 px-6 py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]"><div class="mx-auto w-full max-w-4xl min-w-0" style="min-height: calc(100dvh - var(--header-height) - 4rem);"><div class="flex flex-col"><div class="mb-5 flex flex-col gap-1"><div class="flex items-center justify-between gap-2"><h1 class="text-4xl font-bold"> </h1> <div class="hidden items-center gap-2 md:flex"><!> <!> <!></div></div> <p class="text-muted-foreground! text-lg"> </p> <div class="flex flex-wrap place-items-center gap-1"><!></div></div> <div style="display: contents;" class="page-wrapper"><!></div></div> <!></div> <div class="hidden xl:block"><div class="sticky top-[calc(var(--header-height)+2rem)] h-[calc(100vh-var(--header-height)-4rem)]"><div class="no-scrollbar h-full pb-10"><div class="space-y-2"><span class="text-foreground text-sm font-medium">On This Page</span> <!> <!></div></div></div></div></div>`);

export default function Page_wrapper($$anchor, $$props) {
	$.push($$props, true);

	const toc = new UseToc();
	const docsState = useDocs();
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var h1 = $.child(div_4);
	var text = $.only_child(h1, true);
	var div_5 = $.sibling(h1, 2);
	var node = $.child(div_5);

	CopyMarkdownButton(node, {});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								{
									let $0 = $.derived(() => docsState.doc.prev?.href);

									Button($$anchor, $.spread_props(props, {
										variant: 'secondary',
										size: 'icon',
										class: 'size-8',
										get href() {
											return $.get($0);
										},
										'data-umami-event': 'Navigate backward arrow',
										children: ($$anchor, $$slotProps) => {
											ArrowLeftIcon($$anchor, { class: 'size-4' });
										},
										$$slots: { default: true }
									}));
								}
							};

							$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
							Tooltip_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, docsState.doc.prev.title));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (docsState.doc.prev) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_6 = $.first_child(fragment_5);

			$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
				Tooltip_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root();
						var node_7 = $.first_child(fragment_6);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								{
									let $0 = $.derived(() => docsState.doc.next?.href);

									Button($$anchor, $.spread_props(props, {
										variant: 'secondary',
										size: 'icon',
										class: 'size-8',
										get href() {
											return $.get($0);
										},
										'data-umami-event': 'Navigate forward arrow',
										children: ($$anchor, $$slotProps) => {
											ArrowRightIcon($$anchor, { class: 'size-4' });
										},
										$$slots: { default: true }
									}));
								}
							};

							$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
								Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
							Tooltip_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(() => $.set_text(text_2, docsState.doc.next.title));
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node_5, ($$render) => {
			if (docsState.doc.next) $$render(consequent_1);
		});
	}

	$.reset(div_5);
	$.reset(div_4);

	var p = $.sibling(div_4, 2);
	var text_3 = $.only_child(p, true);
	var div_6 = $.sibling(p, 2);
	var node_9 = $.child(div_6);

	{
		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => docsState.doc.doc.links?.source);

				Badge($$anchor, {
					get href() {
						return $.get($0);
					},
					variant: 'secondary',
					target: '_blank',
					class: 'flex w-fit place-items-center gap-1 rounded-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_10 = $.sibling($.first_child(fragment_11), 2);

						CodeIcon(node_10, { class: 'size-3.5' });
						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_9, ($$render) => {
			if (docsState.doc.doc.links?.source) $$render(consequent_2);
		});
	}

	$.reset(div_6);
	$.reset(div_3);

	var div_7 = $.sibling(div_3, 2);
	var node_11 = $.child(div_7);

	$.snippet(node_11, () => $$props.children);
	$.reset(div_7);
	$.bind_this(div_7, ($$value) => toc.ref = $$value, () => toc?.ref);
	$.reset(div_2);

	var node_12 = $.sibling(div_2, 2);

	{
		const previous = ($$anchor) => {
			var fragment_12 = $.comment();
			var node_13 = $.first_child(fragment_12);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_13 = $.comment();
					var node_14 = $.first_child(fragment_13);

					$.component(node_14, () => Navigation.Previous, ($$anchor, Navigation_Previous) => {
						Navigation_Previous($$anchor, {
							get href() {
								return docsState.doc.prev.href;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text();

								$.template_effect(() => $.set_text(text_4, docsState.doc.prev.title));
								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				};

				$.if(node_13, ($$render) => {
					if (docsState.doc.prev) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_12);
		};

		const next = ($$anchor) => {
			var fragment_15 = $.comment();
			var node_15 = $.first_child(fragment_15);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_16 = $.comment();
					var node_16 = $.first_child(fragment_16);

					$.component(node_16, () => Navigation.Next, ($$anchor, Navigation_Next) => {
						Navigation_Next($$anchor, {
							get href() {
								return docsState.doc.next.href;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, docsState.doc.next.title));
								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_16);
				};

				$.if(node_15, ($$render) => {
					if (docsState.doc.next) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_15);
		};

		$.component(node_12, () => Navigation.Root, ($$anchor, Navigation_Root) => {
			Navigation_Root($$anchor, {
				class: 'pt-10',
				previous,
				next,
				$$slots: { previous: true, next: true }
			});
		});
	}

	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var div_9 = $.child(div_8);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var node_17 = $.sibling($.child(div_11), 2);

	$.component(node_17, () => Toc.Root, ($$anchor, Toc_Root) => {
		Toc_Root($$anchor, {
			get toc() {
				return toc.current;
			}
		});
	});

	var node_18 = $.sibling(node_17, 2);

	CarbonAds(node_18, {});
	$.reset(div_11);
	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, docsState.doc.doc.title);
		$.set_text(text_3, docsState.doc.doc.description);
	});

	$.append($$anchor, div);
	$.pop();
}