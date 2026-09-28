import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, LinkPreview } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import MapPin from "phosphor-svelte/lib/MapPin";
import { fly } from "svelte/transition";

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"><!> <!></div>`);
var root_1 = $.from_html(`<div><div><div class="flex space-x-4"><!> <div class="space-y-1 text-sm"><h4 class="font-medium">@huntabyte</h4> <p>I do things on the internet.</p> <div class="text-muted-foreground flex items-center gap-[21px] pt-2 text-xs"><div class="flex items-center text-xs"><!> <span>FL, USA</span></div> <div class="flex items-center text-xs"><!> <span>Joined May 2020</span></div></div></div></div></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Link_preview_demo_transition($$anchor) {
	let loadingStatusTrigger = $.state("loading");
	let loadingStatusContent = $.state("loading");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => LinkPreview.Root, ($$anchor, LinkPreview_Root) => {
		LinkPreview_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => LinkPreview.Trigger, ($$anchor, LinkPreview_Trigger) => {
					LinkPreview_Trigger($$anchor, {
						href: 'https://github.com/sveltejs',
						target: '_blank',
						rel: 'noreferrer noopener',
						class: 'rounded-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => $.get(loadingStatusTrigger) === 'loaded' ? 'border-foreground' : 'border-transparent');

								$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
									Avatar_Root($$anchor, {
										get class() {
											return `h-12 w-12 rounded-full border ${$.get($0) ?? ''} bg-muted text-muted-foreground text-[17px] font-medium uppercase`;
										},

										get loadingStatus() {
											return $.get(loadingStatusTrigger);
										},

										set loadingStatus($$value) {
											$.set(loadingStatusTrigger, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var div = root();
											var node_3 = $.child(div);

											$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
												Avatar_Image($$anchor, { src: '/avatar-1.png', alt: '@huntabyte' });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
												Avatar_Fallback($$anchor, {
													class: 'border-muted border',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('HB');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div);
											$.append($$anchor, div);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				{
					const child = ($$anchor, $$arg0) => {
						let open = () => ($$arg0?.()).open;
						let props = () => ($$arg0?.()).props;
						let wrapperProps = () => ($$arg0?.()).wrapperProps;
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var div_1 = root_1();

								$.attribute_effect(div_1, () => ({ ...wrapperProps() }));

								var div_2 = $.child(div_1);

								$.attribute_effect(div_2, () => ({ ...props() }));

								var div_3 = $.child(div_2);
								var node_7 = $.child(div_3);

								{
									let $0 = $.derived(() => $.get(loadingStatusContent) === 'loaded' ? 'border-foreground' : 'border-transparent');

									$.component(node_7, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
										Avatar_Root_1($$anchor, {
											get class() {
												return `h-12 w-12 rounded-full border ${$.get($0) ?? ''} bg-muted text-muted-foreground text-[17px] font-medium uppercase`;
											},

											get loadingStatus() {
												return $.get(loadingStatusContent);
											},

											set loadingStatus($$value) {
												$.set(loadingStatusContent, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var div_4 = root();
												var node_8 = $.child(div_4);

												$.component(node_8, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
													Avatar_Image_1($$anchor, { src: '/avatar-1.png', alt: '@huntabyte' });
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
													Avatar_Fallback_1($$anchor, {
														class: 'border-muted border',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('HB');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.reset(div_4);
												$.append($$anchor, div_4);
											},
											$$slots: { default: true }
										});
									});
								}

								var div_5 = $.sibling(node_7, 2);
								var div_6 = $.sibling($.child(div_5), 4);
								var div_7 = $.child(div_6);
								var node_10 = $.child(div_7);

								MapPin(node_10, { class: 'mr-1 size-4' });
								$.next(2);
								$.reset(div_7);

								var div_8 = $.sibling(div_7, 2);
								var node_11 = $.child(div_8);

								CalendarBlank(node_11, { class: 'mr-1 size-4' });
								$.next(2);
								$.reset(div_8);
								$.reset(div_6);
								$.reset(div_5);
								$.reset(div_3);
								$.reset(div_2);
								$.reset(div_1);
								$.transition(3, div_2, () => fly, () => ({ duration: 300 }));
								$.append($$anchor, div_1);
							};

							$.if(node_6, ($$render) => {
								if (open()) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.component(node_5, () => LinkPreview.Content, ($$anchor, LinkPreview_Content) => {
						LinkPreview_Content($$anchor, {
							class: 'border-muted bg-background shadow-popover w-[331px] rounded-xl border p-[17px]',
							sideOffset: 8,
							forceMount: true,
							child,
							$$slots: { child: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}