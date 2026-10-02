import * as $ from 'svelte/internal/server';
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

export default function Chat_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let message = '';
		const messages = initialMessages;
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="border-border w-full border"><div class="bg-background flex place-items-center justify-between border-b p-2"><div class="flex place-items-center gap-2">`);

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: friend.img, alt: friend.username });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Fallback) {
							$$renderer.push('<!--[-->');

							Avatar.Fallback($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(initials(friend.name))}`);
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

			$$renderer.push(` <div class="flex flex-col"><span class="text-sm font-medium">${$.escape(friend.name)}</span> <span class="text-xs">Active 2 mins ago</span></div></div> <div class="flex place-items-center">`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'rounded-full',
				children: ($$renderer) => {
					PhoneIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'rounded-full',
				children: ($$renderer) => {
					VideoIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'rounded-full',
				children: ($$renderer) => {
					InfoIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> `);

			if (Chat.List) {
				$$renderer.push('<!--[-->');

				Chat.List($$renderer, {
					class: 'max-h-[400px]',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(messages);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let msg = each_array[$$index];
							const sender = users.find((u) => u.id === msg.senderId);

							if (Chat.Bubble) {
								$$renderer.push('<!--[-->');

								Chat.Bubble($$renderer, {
									variant: msg.senderId === user.id ? 'sent' : 'received',
									children: ($$renderer) => {
										if (Chat.BubbleAvatar) {
											$$renderer.push('<!--[-->');

											Chat.BubbleAvatar($$renderer, {
												children: ($$renderer) => {
													if (Chat.BubbleAvatarImage) {
														$$renderer.push('<!--[-->');
														Chat.BubbleAvatarImage($$renderer, { src: sender?.img, alt: sender?.username });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Chat.BubbleAvatarFallback) {
														$$renderer.push('<!--[-->');

														Chat.BubbleAvatarFallback($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(initials(sender?.name ?? ''))}`);
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

										$$renderer.push(` `);

										if (Chat.BubbleMessage) {
											$$renderer.push('<!--[-->');

											Chat.BubbleMessage($$renderer, {
												class: 'flex flex-col gap-1',
												children: ($$renderer) => {
													$$renderer.push(`<p>${$.escape(msg.message)}</p> <div class="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end">${$.escape(msg.sentAt)}</div>`);
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
						}

						$$renderer.push(`<!--]--> `);

						if (Chat.Bubble) {
							$$renderer.push('<!--[-->');

							Chat.Bubble($$renderer, {
								variant: 'received',
								children: ($$renderer) => {
									if (Chat.BubbleAvatar) {
										$$renderer.push('<!--[-->');

										Chat.BubbleAvatar($$renderer, {
											children: ($$renderer) => {
												if (Chat.BubbleAvatarImage) {
													$$renderer.push('<!--[-->');
													Chat.BubbleAvatarImage($$renderer, { src: friend.img, alt: friend.username });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Chat.BubbleAvatarFallback) {
													$$renderer.push('<!--[-->');

													Chat.BubbleAvatarFallback($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(initials(friend.name))}`);
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

									$$renderer.push(` `);

									if (Chat.BubbleMessage) {
										$$renderer.push('<!--[-->');
										Chat.BubbleMessage($$renderer, { typing: true });
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <form class="flex place-items-center gap-2 p-2">`);

			if (EmojiPicker.Root) {
				$$renderer.push('<!--[-->');

				EmojiPicker.Root($$renderer, {
					showRecents: true,
					recentsKey: 'emoji-picker-recents',
					disableInitialScroll: true,
					onSelect: (selected) => {
						open = false;
						message += selected.emoji;
					},

					children: ($$renderer) => {
						if (Popover.Root) {
							$$renderer.push('<!--[-->');

							Popover.Root($$renderer, {
								get open() {
									return open;
								},

								set open($$value) {
									open = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');

										Popover.Trigger($$renderer, {
											class: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'shrink-0 rounded-full'),
											children: ($$renderer) => {
												SmilePlusIcon($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'w-auto p-0',
											side: 'top',
											align: 'start',
											children: ($$renderer) => {
												if (EmojiPicker.Search) {
													$$renderer.push('<!--[-->');
													EmojiPicker.Search($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (EmojiPicker.List) {
													$$renderer.push('<!--[-->');
													EmojiPicker.List($$renderer, { class: 'h-[175px]' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function children($$renderer, { active }) {
														$$renderer.push(`<div class="flex w-[calc(100%-40px)] items-center gap-2"><span class="text-lg">${$.escape(active?.emoji)}</span> <span class="text-muted-foreground truncate text-xs">${$.escape(active?.data.name)}</span></div> `);

														if (EmojiPicker.SkinToneSelector) {
															$$renderer.push('<!--[-->');
															EmojiPicker.SkinToneSelector($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													if (EmojiPicker.Footer) {
														$$renderer.push('<!--[-->');

														EmojiPicker.Footer($$renderer, {
															class: 'relative flex max-w-[232px] place-items-center gap-2 px-2',
															children,
															$$slots: { default: true }
														});

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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Input($$renderer, {
				class: 'rounded-full',
				placeholder: 'Type a message...',
				get value() {
					return message;
				},

				set value($$value) {
					message = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				variant: 'default',
				size: 'icon',
				class: 'shrink-0 rounded-full',
				disabled: message === '',
				children: ($$renderer) => {
					SendIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}