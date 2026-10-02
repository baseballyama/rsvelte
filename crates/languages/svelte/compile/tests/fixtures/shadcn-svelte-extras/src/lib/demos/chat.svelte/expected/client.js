import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Chat from '$lib/components/ui/chat';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import * as Popover from '$lib/components/ui/popover';
import * as Avatar from '$lib/components/ui/avatar';
import { buttonVariants } from '$lib/components/ui/button';
import Button from '$lib/components/button.svelte';
import InfoIcon from '@lucide/svelte/icons/info';
import PhoneIcon from '@lucide/svelte/icons/phone';
import SendIcon from '@lucide/svelte/icons/send';
import SmilePlusIcon from '@lucide/svelte/icons/smile-plus';
import VideoIcon from '@lucide/svelte/icons/video';
import { Input } from '$lib/components/ui/input';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p> <div class="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end"> </div>`, 1);
var root_2 = $.from_html(`<div class="flex w-[calc(100%-40px)] items-center gap-2"><span class="text-lg"> </span> <span class="text-muted-foreground truncate text-xs"> </span></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="border-border w-full border"><div class="bg-background flex place-items-center justify-between border-b p-2"><div class="flex place-items-center gap-2"><!> <div class="flex flex-col"><span class="text-sm font-medium"> </span> <span class="text-xs">Active 2 mins ago</span></div></div> <div class="flex place-items-center"><!> <!> <!></div></div> <!> <form class="flex place-items-center gap-2 p-2"><!> <!> <!></form></div>`);

export default function Chat_1($$anchor, $$props) {
	$.push($$props, true);

	const formatShortTime = (date) => {
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	};

	const initials = (name) => name.split(' ').map((n) => n[0]).join('');
	const firstMessageMinutesAgo = 25;
	const now = new Date();
	const baseTime = new Date(now.getTime() - firstMessageMinutesAgo * 60000);

	const user = {
		id: '123456',
		name: 'Jane Doe',
		username: '@janedoe',
		img: 'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350'
	};

	const friend = {
		id: '654321',
		name: 'John Doe',
		username: '@johndoe',
		img: 'https://images.freeimages.com/images/large-previews/fdd/man-avatar-1632964.jpg?fmt=webp&h=35'
	};

	const users = [user, friend];

	const initialMessages = [
		{
			senderId: '123456',
			message: 'Hey, did you see Svelte 5 just got released?',
			sentAt: formatShortTime(new Date(baseTime.getTime()))
		},

		{
			senderId: '654321',
			message: 'Yes! The runes system looks really interesting!',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 3 * 60000))
		},

		{
			senderId: '123456',
			message: 'Right? Such a big change from the previous reactive system',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 5 * 60000))
		},

		{
			senderId: '654321',
			message: 'Have you tried migrating any projects to it yet?',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 8 * 60000))
		},

		{
			senderId: '123456',
			message: 'Just started with a small one. The migration guide is super helpful',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 10 * 60000))
		},

		{
			senderId: '654321',
			message: 'Any breaking changes causing issues?',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 13 * 60000))
		},

		{
			senderId: '123456',
			message: 'The new $state syntax took some getting used to, but its cleaner now',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 15 * 60000))
		},

		{
			senderId: '654321',
			message: 'The performance improvements are impressive too',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 18 * 60000))
		},

		{
			senderId: '123456',
			message: 'Yeah, the compiler optimizations are amazing. Much faster now',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 20 * 60000))
		},

		{
			senderId: '654321',
			message: 'Looking forward to using it in my next project!',
			sentAt: formatShortTime(new Date(baseTime.getTime() + 23 * 60000))
		}
	];

	let message = $.state('');
	const messages = $.proxy(initialMessages);
	let open = $.state(false);
	var div = root_4();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
		Avatar_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
					Avatar_Image($$anchor, {
						get src() {
							return friend.img;
						},

						get alt() {
							return friend.username;
						}
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
					Avatar_Fallback($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(($0) => $.set_text(text, $0), [() => initials(friend.name)]);
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_3 = $.sibling(node, 2);
	var span = $.child(div_3);
	var text_1 = $.only_child(span, true);

	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_3 = $.child(div_4);

	Button(node_3, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			PhoneIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			VideoIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			InfoIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	$.component(node_6, () => Chat.List, ($$anchor, Chat_List) => {
		Chat_List($$anchor, {
			class: 'max-h-[400px]',
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_7 = $.first_child(fragment_5);

				$.each(node_7, 16, () => messages, (msg) => msg, ($$anchor, msg) => {
					const sender = $.derived(() => users.find((u) => u.id === msg.senderId));
					var fragment_6 = $.comment();
					var node_8 = $.first_child(fragment_6);

					{
						let $0 = $.derived(() => msg.senderId === user.id ? 'sent' : 'received');

						$.component(node_8, () => Chat.Bubble, ($$anchor, Chat_Bubble) => {
							Chat_Bubble($$anchor, {
								get variant() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_9 = $.first_child(fragment_7);

									$.component(node_9, () => Chat.BubbleAvatar, ($$anchor, Chat_BubbleAvatar) => {
										Chat_BubbleAvatar($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_10 = $.first_child(fragment_8);

												{
													let $0 = $.derived(() => $.get(sender)?.img);
													let $1 = $.derived(() => $.get(sender)?.username);

													$.component(node_10, () => Chat.BubbleAvatarImage, ($$anchor, Chat_BubbleAvatarImage) => {
														Chat_BubbleAvatarImage($$anchor, {
															get src() {
																return $.get($0);
															},

															get alt() {
																return $.get($1);
															}
														});
													});
												}

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Chat.BubbleAvatarFallback, ($$anchor, Chat_BubbleAvatarFallback) => {
													Chat_BubbleAvatarFallback($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(($0) => $.set_text(text_2, $0), [() => initials($.get(sender)?.name ?? '')]);
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_9, 2);

									$.component(node_12, () => Chat.BubbleMessage, ($$anchor, Chat_BubbleMessage) => {
										Chat_BubbleMessage($$anchor, {
											class: 'flex flex-col gap-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var p = $.first_child(fragment_10);
												var text_3 = $.only_child(p, true);
												var div_5 = $.sibling(p, 2);
												var text_4 = $.only_child(div_5, true);

												$.template_effect(() => {
													$.set_text(text_3, msg.message);
													$.set_text(text_4, msg.sentAt);
												});

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
					}

					$.append($$anchor, fragment_6);
				});

				var node_13 = $.sibling(node_7, 2);

				$.component(node_13, () => Chat.Bubble, ($$anchor, Chat_Bubble_1) => {
					Chat_Bubble_1($$anchor, {
						variant: 'received',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_14 = $.first_child(fragment_11);

							$.component(node_14, () => Chat.BubbleAvatar, ($$anchor, Chat_BubbleAvatar_1) => {
								Chat_BubbleAvatar_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root();
										var node_15 = $.first_child(fragment_12);

										$.component(node_15, () => Chat.BubbleAvatarImage, ($$anchor, Chat_BubbleAvatarImage_1) => {
											Chat_BubbleAvatarImage_1($$anchor, {
												get src() {
													return friend.img;
												},

												get alt() {
													return friend.username;
												}
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Chat.BubbleAvatarFallback, ($$anchor, Chat_BubbleAvatarFallback_1) => {
											Chat_BubbleAvatarFallback_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text();

													$.template_effect(($0) => $.set_text(text_5, $0), [() => initials(friend.name)]);
													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_14, 2);

							$.component(node_17, () => Chat.BubbleMessage, ($$anchor, Chat_BubbleMessage_1) => {
								Chat_BubbleMessage_1($$anchor, { typing: true });
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var form = $.sibling(node_6, 2);
	var node_18 = $.child(form);

	$.component(node_18, () => EmojiPicker.Root, ($$anchor, EmojiPicker_Root) => {
		EmojiPicker_Root($$anchor, {
			showRecents: true,
			recentsKey: 'emoji-picker-recents',
			disableInitialScroll: true,
			onSelect: (selected) => {
				$.set(open, false);
				$.set(message, $.get(message) + selected.emoji);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_14 = $.comment();
				var node_19 = $.first_child(fragment_14);

				$.component(node_19, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						get open() {
							return $.get(open);
						},

						set open($$value) {
							$.set(open, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root();
							var node_20 = $.first_child(fragment_15);

							{
								let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'shrink-0 rounded-full'));

								$.component(node_20, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, {
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											SmilePlusIcon($$anchor, {});
										},
										$$slots: { default: true }
									});
								});
							}

							var node_21 = $.sibling(node_20, 2);

							$.component(node_21, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'w-auto p-0',
									side: 'top',
									align: 'start',
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root_3();
										var node_22 = $.first_child(fragment_17);

										$.component(node_22, () => EmojiPicker.Search, ($$anchor, EmojiPicker_Search) => {
											EmojiPicker_Search($$anchor, {});
										});

										var node_23 = $.sibling(node_22, 2);

										$.component(node_23, () => EmojiPicker.List, ($$anchor, EmojiPicker_List) => {
											EmojiPicker_List($$anchor, { class: 'h-[175px]' });
										});

										var node_24 = $.sibling(node_23, 2);

										{
											const children = ($$anchor, $$arg0) => {
												let active = () => ($$arg0?.()).active;
												var fragment_18 = root_2();
												var div_6 = $.first_child(fragment_18);
												var span_1 = $.child(div_6);
												var text_6 = $.only_child(span_1, true);
												var span_2 = $.sibling(span_1, 2);
												var text_7 = $.only_child(span_2, true);

												$.reset(div_6);

												var node_25 = $.sibling(div_6, 2);

												$.component(node_25, () => EmojiPicker.SkinToneSelector, ($$anchor, EmojiPicker_SkinToneSelector) => {
													EmojiPicker_SkinToneSelector($$anchor, {});
												});

												$.template_effect(() => {
													$.set_text(text_6, active()?.emoji);
													$.set_text(text_7, active()?.data.name);
												});

												$.append($$anchor, fragment_18);
											};

											$.component(node_24, () => EmojiPicker.Footer, ($$anchor, EmojiPicker_Footer) => {
												EmojiPicker_Footer($$anchor, {
													class: 'relative flex max-w-[232px] place-items-center gap-2 px-2',
													children,
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_14);
			},
			$$slots: { default: true }
		});
	});

	var node_26 = $.sibling(node_18, 2);

	Input(node_26, {
		class: 'rounded-full',
		placeholder: 'Type a message...',
		get value() {
			return $.get(message);
		},

		set value($$value) {
			$.set(message, $$value, true);
		}
	});

	var node_27 = $.sibling(node_26, 2);

	{
		let $0 = $.derived(() => $.get(message) === '');

		Button(node_27, {
			type: 'submit',
			variant: 'default',
			size: 'icon',
			class: 'shrink-0 rounded-full',
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				SendIcon($$anchor, {});
			},
			$$slots: { default: true }
		});
	}

	$.reset(form);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, friend.name));

	$.event('submit', form, (e) => {
		e.preventDefault();

		messages.push({
			message: $.get(message),
			senderId: user.id,
			sentAt: formatShortTime(new Date())
		});

		$.set(message, '');
	});

	$.append($$anchor, div);
	$.pop();
}