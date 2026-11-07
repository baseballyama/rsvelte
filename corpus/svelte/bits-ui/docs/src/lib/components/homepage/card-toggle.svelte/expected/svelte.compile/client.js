import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, DropdownMenu, Tabs } from "bits-ui";
import Cardholder from "phosphor-svelte/lib/Cardholder";
import DotsThreeVertical from "phosphor-svelte/lib/DotsThreeVertical";
import UserCircle from "phosphor-svelte/lib/UserCircle";

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full"><!> <!></div>`);
var root_1 = $.from_html(`<div class="flex items-center"><!> Profile</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">P</kbd></div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center"><!> Billing</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">B</kbd></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="mb-3 flex items-center justify-between"><div class="flex"><!> <div class="name ml-1.5 lg:ml-2"><h3 class="text-xxs text-foreground font-medium lg:text-sm dark:text-[#171717]"> </h3> <p class="text-muted-foreground text-[9px] font-medium lg:text-[12px] dark:text-[#171717]/50"> </p></div></div> <!></div>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="relative order-3 flex h-min translate-y-14 border border-solid border-[#cccccc] lg:order-4 lg:translate-y-[40%]"><div class="circle absolute left-0 top-0 aspect-square w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="circle absolute right-0 top-0 aspect-square w-3 -translate-y-1/2 translate-x-1/2 rounded-full border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="middle aspect-24/6 absolute left-1/2 top-0 w-6 -translate-x-1/2 -translate-y-1/2 rounded-[7px] border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="middle aspect-24/6 absolute bottom-0 left-1/2 w-6 -translate-x-1/2 translate-y-1/2 rounded-[7px] border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="circle absolute bottom-0 left-0 aspect-square w-3 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="circle absolute bottom-0 right-0 aspect-square w-3 translate-x-1/2 translate-y-1/2 rounded-full border border-[#A3A3A4] bg-white dark:border-white dark:bg-[#131313]"></div> <div class="rounded-card-lg m-1.5 aspect-square w-full bg-[#FEFCE8] px-3 py-3 lg:m-[10px] lg:px-[14px] dark:bg-[#FFFBD4]"><!></div></div>`);

export default function Card_toggle($$anchor) {
	const UserListItem = ($$anchor, $$arg0) => {
		let src = () => ($$arg0?.()).src;
		let alt = () => ($$arg0?.()).alt;
		let fallback = () => ($$arg0?.()).fallback;
		let firstName = () => ($$arg0?.()).firstName;
		let username = () => ($$arg0?.()).username;
		var div = root_4();
		var div_1 = $.child(div);
		var node = $.child(div_1);

		{
			let $0 = $.derived(() => $.get(loadingStatus) === 'loaded' ? 'border-foreground' : 'border-transparent');

			$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
				Avatar_Root($$anchor, {
					get class() {
						return `h-7 w-7 rounded-full border lg:h-10 lg:w-10 ${$.get($0) ?? ''} bg-muted text-muted-foreground text-[17px] font-medium uppercase dark:border-[#807F82]`;
					},

					get loadingStatus() {
						return $.get(loadingStatus);
					},

					set loadingStatus($$value) {
						$.set(loadingStatus, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var div_2 = root();
						var node_1 = $.child(div_2);

						$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
							Avatar_Image($$anchor, {
								get src() {
									return src();
								},

								get alt() {
									return alt();
								}
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
							Avatar_Fallback($$anchor, {
								class: 'border-muted border',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, fallback()));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_2);
						$.append($$anchor, div_2);
					},
					$$slots: { default: true }
				});
			});
		}

		var div_3 = $.sibling(node, 2);
		var h3 = $.child(div_3);
		var text_1 = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_2 = $.only_child(p);

		$.reset(div_3);
		$.reset(div_1);

		var node_3 = $.sibling(div_1, 2);

		$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
			DropdownMenu_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_3();
					var node_4 = $.first_child(fragment_1);

					$.component(node_4, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							class: 'focus-visible  text-a-foreground border-border-input shadow-mini hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background inline-flex size-6 cursor-pointer select-none items-center justify-center rounded-[7px] border bg-white text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] lg:size-8 dark:border-[#D8D8D8] dark:shadow-[0px_0.8px_0px_0.8px_rgba(0,_0,_0,_0.04)] dark:hover:bg-white',
							'aria-label': 'Open menu',
							children: ($$anchor, $$slotProps) => {
								DotsThreeVertical($$anchor, {
									class: 'text-foreground size-4 lg:size-5 dark:text-[#171717]'
								});
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
						DropdownMenu_Portal($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.component(node_6, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
									DropdownMenu_Content($$anchor, {
										class: 'focus-override border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden w-[229px] rounded-xl border px-1 py-1.5',
										sideOffset: 8,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_3();
											var node_7 = $.first_child(fragment_4);

											$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
												DropdownMenu_Item($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var div_4 = $.first_child(fragment_5);
														var node_8 = $.child(div_4);

														UserCircle(node_8, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_4);
														$.next(2);
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_7, 2);

											$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
												DropdownMenu_Item_1($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_2();
														var div_5 = $.first_child(fragment_6);
														var node_10 = $.child(div_5);

														Cardholder(node_10, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_5);
														$.next(2);
														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div);

		$.template_effect(() => {
			$.set_text(text_1, firstName());
			$.set_text(text_2, `@${username() ?? ''}`);
		});

		$.append($$anchor, div);
	};

	let loadingStatus = $.state("loading");
	var div_6 = root_6();
	var div_7 = $.sibling($.child(div_6), 12);
	var node_11 = $.child(div_7);

	$.component(node_11, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'follow',
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_5();
				var node_12 = $.first_child(fragment_7);

				$.component(node_12, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'rounded-input shadow-mini-inset mb-[10px] flex h-7 items-center bg-[#18181B12] px-[3px] py-1 lg:mb-[14px] lg:h-10 dark:shadow-[0px_1px_0px_0px_rgba(0,_0,_0,_0.04)_inset]',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var node_13 = $.first_child(fragment_8);

							$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'follow',
									class: 'text-xxs text-foreground/70 data-[state=active]:text-foreground data-[state=active]:shadow-mini h-[23px] w-full cursor-pointer rounded-[7px] font-medium data-[state=active]:bg-white lg:h-8 lg:text-sm dark:text-[#171717]/70 dark:data-[state=active]:text-[#171717] dark:data-[state=active]:shadow-[0px_1px_0px_1px_rgba(0,_0,_0,_0.04);]',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Follow');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'other',
									class: 'text-xxs text-foreground/70 data-[state=active]:text-foreground data-[state=active]:shadow-mini h-[23px] w-full cursor-pointer rounded-[7px] font-medium data-[state=active]:bg-white lg:h-8 lg:text-sm dark:text-[#171717]/70 dark:data-[state=active]:text-[#171717] dark:data-[state=active]:shadow-[0px_1px_0px_1px_rgba(0,_0,_0,_0.04);]',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Other');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_15 = $.sibling(node_12, 2);

				$.component(node_15, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'follow',
						class: 'select-none ',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_16 = $.first_child(fragment_9);

							UserListItem(node_16, () => ({
								alt: "@huntabyte",
								src: "/avatar-1.png",
								fallback: "HB",
								firstName: "Huntabyte",
								username: "huntabyte"
							}));

							var node_17 = $.sibling(node_16, 2);

							UserListItem(node_17, () => ({
								alt: "@pavelstianko",
								src: "/avatar-1.png",
								fallback: "PS",
								firstName: "Pavel",
								username: "pavelstianko"
							}));

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				var node_18 = $.sibling(node_15, 2);

				$.component(node_18, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'other',
						class: 'select-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_3();
							var node_19 = $.first_child(fragment_10);

							UserListItem(node_19, () => ({
								alt: "@pája",
								src: "/avatar-1.png",
								fallback: "PJ",
								firstName: "Pája",
								username: "paja"
							}));

							var node_20 = $.sibling(node_19, 2);

							UserListItem(node_20, () => ({
								alt: "@CokaKoala",
								src: "/avatar-1.png",
								fallback: "PS",
								firstName: "Adrian",
								username: "AdrianGonz97"
							}));

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_7);
	$.reset(div_6);
	$.append($$anchor, div_6);
}