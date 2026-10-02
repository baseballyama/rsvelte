import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { date } from '$lib/core/utils';
import Textarea from '$lib/components/ui/textarea/textarea.svelte';
import { MessagesModule } from '$lib/core/composables/index.js';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-5 p-5"><div class="bg-primary-50 h-16 w-full animate-pulse"></div> <ul class="m-0 flex list-none flex-col gap-5 p-0"></ul></div>`);
var root_2 = $.from_html(`<img height="48" width="48" alt="avatar" class="h-12 w-12 rounded-full object-cover object-center"/>`);
var root_3 = $.from_html(`<div class="bg-primary-50 h-12 w-12 rounded-full"></div>`);
var root_4 = $.from_html(`<img class="h-20 w-auto object-contain object-bottom"/>`);
var root_5 = $.from_html(`<div><div></div> <div> </div></div>`);
var root_6 = $.from_html(`<div><!> <!></div>`);
var root_7 = $.from_html(`<div class="flex h-16 items-center justify-between gap-5 border-b px-5"><div class="flex flex-1 items-center gap-5"><button type="button" class="text-primary-500 hover:text-primary-700 transition duration-300 focus:outline-none"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg> <span class="sr-only">Back to chat list</span></button> <div class="flex flex-1 items-center gap-2"><!> <div class="flex flex-col gap-1 leading-4"><span class="font-semibold"> </span> <span class="text-sm"> </span></div></div></div> <button type="button" class="text-primary-500 hover:text-primary-700 transition duration-300 focus:outline-none"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg> <span class="sr-only">Close chat</span></button></div> <div class="flex h-[400px] items-end overflow-y-auto"><div class="flex h-[400px] w-full flex-col gap-2 overflow-auto p-5"><!></div></div> <form class="sticky inset-x-0 bottom-0 flex flex-col justify-between gap-1 border-b border-t bg-inherit p-5"><!> <button type="submit" id="send_new_message" class="mt-3 flex w-full items-center justify-center gap-2 border px-3 py-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path></svg> Send</button></form>`, 1);
var root_8 = $.from_html(`<img height="48" alt="avatar" width="48" class="h-12 w-12 rounded-full object-cover object-center"/>`);
var root_9 = $.from_html(`<div class="bg-brand-500 h-2 w-2 rounded-full"></div>`);
var root_10 = $.from_html(`<div class="flex flex-1 items-center gap-5"><!> <div class="flex-1 truncate"> </div></div> <!>`, 1);
var root_11 = $.from_html(`<li><button type="button" class="hover:bg-primary-50 flex w-full items-center justify-between gap-5 px-5 py-3 text-left transition duration-300 focus:outline-none"><!></button></li>`);
var root_12 = $.from_html(`<div class="relative flex h-16 w-full items-center border-b"><div class="w-full text-center font-semibold"> </div></div> <div class="flex h-16 items-center border-b"><div class="flex h-16 w-16 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path></svg></div> <input type="text" name="" id="" placeholder="Search Messages" class="h-full w-full bg-inherit py-3 pr-5 focus:outline-none"/></div> <div class="h-[522px]"><ul class="m-0 flex h-full list-none flex-col divide-y overflow-y-auto pb-60"></ul></div>`, 1);
var root_13 = $.from_html(`<div class="flex h-full w-full flex-col items-center justify-center gap-5 p-5 text-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-8 w-8"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"></path></svg> <span>You have no messages</span></div>`);
var root_14 = $.from_html(`<img alt="avatar" height="48" width="48" class="h-12 w-12 rounded-full object-cover object-center"/>`);
var root_15 = $.from_html(`<div class="h-[522px]"><ul class="m-0 flex h-full list-none flex-col divide-y overflow-y-auto pb-60"></ul></div>`);
var root_16 = $.from_html(`<div class="flex h-full w-full flex-col items-center justify-center gap-5 p-5 text-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-8 w-8"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"></path></svg> <span>No chat found</span></div>`);
var root_17 = $.from_html(`<div class="flex h-full flex-col justify-end"><div class="flex w-full flex-col gap-2 overflow-auto p-5"><!></div> <form class="inset-x-0 bottom-0 flex flex-col justify-between gap-1 border-b border-t bg-inherit p-5"><!> <button type="submit" id="send_new_message" class="mt-3 flex w-full items-center justify-center gap-2 border px-3 py-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path></svg> Send</button></form></div>`);
var root_18 = $.from_html(`<div class="flex h-full flex-col items-center justify-center gap-2 text-center font-medium"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"></path></svg> <span>Select a conversation</span></div>`);
var root_19 = $.from_html(`<div class="block h-[650px] overflow-hidden rounded-lg border text-sm shadow xl:hidden"><!></div> <div class="hidden h-[650px] items-start justify-start divide-x rounded-lg border text-sm xl:flex"><div class="w-80"><div class="relative flex h-16 w-full items-center border-b"><div class="w-full text-center font-semibold"> </div></div> <div class="flex h-16 items-center border-b"><div class="flex h-16 w-16 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path></svg></div> <input type="text" name="" id="" placeholder="Search Messages" class="h-full w-full bg-inherit py-3 pr-5 focus:outline-none"/></div> <!></div> <div class="relative h-[650px] w-full flex-1 overflow-y-auto"><!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const messagesModule = new MessagesModule();
	var fragment = root_19();

	$.head('gf3q3k', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Messages';
		});
	});

	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var ul = $.sibling($.child(div_1), 2);

			$.each(ul, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				var li = root();
				var node_1 = $.child(li);

				Skeleton(node_1, {});
				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_5 = ($$anchor) => {
			var fragment_1 = root_7();
			var div_2 = $.first_child(fragment_1);
			var div_3 = $.child(div_2);
			var button = $.child(div_3);
			var div_4 = $.sibling(button, 2);
			var node_2 = $.child(div_4);

			{
				var consequent_1 = ($$anchor) => {
					var img = root_2();

					$.template_effect(() => $.set_attribute(img, 'src', messagesModule.selectedChat?.user?.avatar));
					$.append($$anchor, img);
				};

				var alternate = ($$anchor) => {
					var div_5 = root_3();

					$.append($$anchor, div_5);
				};

				$.if(node_2, ($$render) => {
					if (messagesModule.selectedChat?.user?.avatar) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var div_6 = $.sibling(node_2, 2);
			var span = $.child(div_6);
			var text = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_6);
			$.reset(div_4);
			$.reset(div_3);

			var button_1 = $.sibling(div_3, 2);

			$.reset(div_2);

			var div_7 = $.sibling(div_2, 2);
			var div_8 = $.child(div_7);
			var node_3 = $.child(div_8);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.each(node_4, 19, () => messagesModule.selectedChat?.messages, (m) => m?.id, ($$anchor, m) => {
						var div_9 = root_6();
						var node_5 = $.child(div_9);

						{
							var consequent_2 = ($$anchor) => {
								var img_1 = root_4();

								$.template_effect(() => {
									$.set_attribute(img_1, 'src', $.get(m)?.message?.img);
									$.set_attribute(img_1, 'alt', `img ${$.get(m)?.message?.created_at ?? ''}`);
								});

								$.append($$anchor, img_1);
							};

							$.if(node_5, ($$render) => {
								if ($.get(m)?.message?.img) $$render(consequent_2);
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							var consequent_3 = ($$anchor) => {
								var div_10 = root_5();
								var div_11 = $.child(div_10);

								$.html(div_11, () => $.get(m)?.message?.message, true);
								$.reset(div_11);

								var div_12 = $.sibling(div_11, 2);
								var text_2 = $.only_child(div_12, true);

								$.reset(div_10);

								$.template_effect(
									($0, $1) => {
										$.set_class(div_10, 1, `max-w-[70%] rounded-md px-3 py-1.5 text-sm min-w-[${$0 ?? ''}px] flex flex-col border shadow
									${$.get(m)?.message?.from === messagesModule.me?.id ? 'bg-gray-50' : 'text-primary-700 bg-inherit'}`);

										$.set_class(div_11, 1, $.clsx($.get(m)?.message?.from == messagesModule.me?.id ? 'self-end' : 'self-start'));
										$.set_class(div_12, 1, `ml-auto text-xs text-gray-400 ${$.get(m)?.message?.from == messagesModule.me?.id ? 'self-end' : 'self-start'}`);
										$.set_text(text_2, $1);
									},
									[
										() => date($.get(m)?.message?.created_at).length + 10,
										() => date($.get(m)?.message?.created_at)
									]
								);

								$.append($$anchor, div_10);
							};

							$.if(node_6, ($$render) => {
								if ($.get(m)?.message?.message) $$render(consequent_3);
							});
						}

						$.reset(div_9);

						$.template_effect(() => $.set_class(div_9, 1, `flex w-full flex-col gap-0.5
							${$.get(m)?.message?.from == messagesModule.me?.id ? 'items-end justify-end' : 'items-start justify-start'}`));

						$.append($$anchor, div_9);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (messagesModule.selectedChat?.messages?.length) $$render(consequent_4);
				});
			}

			$.reset(div_8);
			$.bind_this(div_8, ($$value) => messagesModule.mobileScrollRef = $$value, () => messagesModule?.mobileScrollRef);
			$.reset(div_7);

			var form = $.sibling(div_7, 2);
			var node_7 = $.child(form);

			Textarea(node_7, {
				placeholder: 'Type a message',
				class: 'h-16 w-full bg-inherit py-3 pr-5 focus:outline-none',
				get value() {
					return messagesModule.newMessage.message;
				},

				set value($$value) {
					messagesModule.newMessage.message = $$value;
				}
			});

			$.next(2);
			$.reset(form);

			$.template_effect(() => {
				$.set_text(text, messagesModule.selectedChat?.brand?.businessName || messagesModule.selectedChat?.user?.businessName || '');
				$.set_text(text_1, messagesModule.selectedChat?.user?.fullName);
			});

			$.delegated('click', button, () => {
				messagesModule.selectedChat = null;
				messagesModule.getAllChats();
			});

			$.delegated('click', button_1, () => {
				messagesModule.showChatInbox = false;
				messagesModule.selectedChat = null;
			});

			$.event('submit', form, function (...$$args) {
				messagesModule.sendMessage?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_9 = ($$anchor) => {
			var fragment_3 = root_12();
			var div_13 = $.first_child(fragment_3);
			var div_14 = $.child(div_13);
			var text_3 = $.only_child(div_14);

			$.reset(div_13);

			var div_15 = $.sibling(div_13, 2);
			var input = $.sibling($.child(div_15), 2);

			$.remove_input_defaults(input);
			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var ul_1 = $.child(div_16);

			$.each(ul_1, 21, () => messagesModule.filteredAllChats, $.index, ($$anchor, chat) => {
				var li_1 = root_11();
				var button_2 = $.child(li_1);
				var node_8 = $.child(button_2);

				{
					var consequent_8 = ($$anchor) => {
						var fragment_4 = root_10();
						var div_17 = $.first_child(fragment_4);
						var node_9 = $.child(div_17);

						{
							var consequent_6 = ($$anchor) => {
								var img_2 = root_8();

								$.template_effect(() => $.set_attribute(img_2, 'src', $.get(chat)?.chat?.logo));
								$.append($$anchor, img_2);
							};

							var alternate_1 = ($$anchor) => {
								var div_18 = root_3();

								$.append($$anchor, div_18);
							};

							$.if(node_9, ($$render) => {
								if ($.get(chat)?.chat?.logo) $$render(consequent_6); else $$render(alternate_1, -1);
							});
						}

						var div_19 = $.sibling(node_9, 2);
						var text_4 = $.only_child(div_19, true);

						$.reset(div_17);

						var node_10 = $.sibling(div_17, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_20 = root_9();

								$.append($$anchor, div_20);
							};

							$.if(node_10, ($$render) => {
								if (!$.get(chat)?.messages[$.get(chat)?.messages?.length - 1]?.message?.seen) $$render(consequent_7);
							});
						}

						$.template_effect(() => $.set_text(text_4, $.get(chat)?.chat?.businessName || $.get(chat)?.user?.fullName || $.get(chat)?.user?.businessName));
						$.append($$anchor, fragment_4);
					};

					$.if(node_8, ($$render) => {
						if ($.get(chat)) $$render(consequent_8);
					});
				}

				$.reset(button_2);
				$.reset(li_1);
				$.delegated('click', button_2, () => messagesModule.handleSelectedChatInbox($.get(chat)));
				$.append($$anchor, li_1);
			});

			$.reset(ul_1);
			$.reset(div_16);
			$.template_effect(() => $.set_text(text_3, `Chat (${messagesModule.chatsCount ?? ''})`));
			$.bind_value(input, () => messagesModule.searchValue, ($$value) => messagesModule.searchValue = $$value);
			$.append($$anchor, fragment_3);
		};

		var alternate_2 = ($$anchor) => {
			var div_21 = root_13();

			$.append($$anchor, div_21);
		};

		$.if(node, ($$render) => {
			if (messagesModule.loading) $$render(consequent); else if (messagesModule.selectedChat) $$render(consequent_5, 1); else if (messagesModule.filteredAllChats?.length) $$render(consequent_9, 2); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);

	var div_22 = $.sibling(div, 2);
	var div_23 = $.child(div_22);
	var div_24 = $.child(div_23);
	var div_25 = $.child(div_24);
	var text_5 = $.only_child(div_25);

	$.reset(div_24);

	var div_26 = $.sibling(div_24, 2);
	var input_1 = $.sibling($.child(div_26), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_26);

	var node_11 = $.sibling(div_26, 2);

	{
		var consequent_13 = ($$anchor) => {
			var div_27 = root_15();
			var ul_2 = $.child(div_27);

			$.each(ul_2, 21, () => messagesModule.filteredAllChats, $.index, ($$anchor, chat) => {
				var li_2 = root_11();
				var button_3 = $.child(li_2);
				var node_12 = $.child(button_3);

				{
					var consequent_12 = ($$anchor) => {
						var fragment_5 = root_10();
						var div_28 = $.first_child(fragment_5);
						var node_13 = $.child(div_28);

						{
							var consequent_10 = ($$anchor) => {
								var img_3 = root_14();

								$.template_effect(() => $.set_attribute(img_3, 'src', $.get(chat)?.user?.avatar));
								$.append($$anchor, img_3);
							};

							var alternate_3 = ($$anchor) => {
								var div_29 = root_3();

								$.append($$anchor, div_29);
							};

							$.if(node_13, ($$render) => {
								if ($.get(chat)?.user?.avatar) $$render(consequent_10); else $$render(alternate_3, -1);
							});
						}

						var div_30 = $.sibling(node_13, 2);
						var text_6 = $.only_child(div_30, true);

						$.reset(div_28);

						var node_14 = $.sibling(div_28, 2);

						{
							var consequent_11 = ($$anchor) => {
								var div_31 = root_9();

								$.append($$anchor, div_31);
							};

							$.if(node_14, ($$render) => {
								if (!$.get(chat)?.messages[$.get(chat)?.messages?.length - 1]?.message?.seen) $$render(consequent_11);
							});
						}

						$.template_effect(() => $.set_text(text_6, $.get(chat)?.brand?.businessName || $.get(chat)?.user?.fullName || $.get(chat)?.user?.businessName));
						$.append($$anchor, fragment_5);
					};

					$.if(node_12, ($$render) => {
						if ($.get(chat)) $$render(consequent_12);
					});
				}

				$.reset(button_3);
				$.reset(li_2);
				$.delegated('click', button_3, () => messagesModule.handleSelectedChatInbox($.get(chat)));
				$.append($$anchor, li_2);
			});

			$.reset(ul_2);
			$.reset(div_27);
			$.append($$anchor, div_27);
		};

		var consequent_14 = ($$anchor) => {
			var div_32 = root_1();
			var ul_3 = $.sibling($.child(div_32), 2);

			$.each(ul_3, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				var li_3 = root();
				var node_15 = $.child(li_3);

				Skeleton(node_15, {});
				$.reset(li_3);
				$.append($$anchor, li_3);
			});

			$.reset(ul_3);
			$.reset(div_32);
			$.append($$anchor, div_32);
		};

		var alternate_4 = ($$anchor) => {
			var div_33 = root_16();

			$.append($$anchor, div_33);
		};

		$.if(node_11, ($$render) => {
			if (messagesModule.filteredAllChats?.length) $$render(consequent_13); else if (messagesModule.loadingForChats) $$render(consequent_14, 1); else $$render(alternate_4, -1);
		});
	}

	$.reset(div_23);

	var div_34 = $.sibling(div_23, 2);
	var node_16 = $.child(div_34);

	{
		var consequent_15 = ($$anchor) => {
			var div_35 = root_1();
			var ul_4 = $.sibling($.child(div_35), 2);

			$.each(ul_4, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				var li_4 = root();
				var node_17 = $.child(li_4);

				Skeleton(node_17, {});
				$.reset(li_4);
				$.append($$anchor, li_4);
			});

			$.reset(ul_4);
			$.reset(div_35);
			$.append($$anchor, div_35);
		};

		var consequent_19 = ($$anchor) => {
			var div_36 = root_17();
			var div_37 = $.child(div_36);
			var node_18 = $.child(div_37);

			{
				var consequent_18 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_19 = $.first_child(fragment_6);

					$.each(node_19, 19, () => messagesModule.selectedChat?.messages, (m) => m?.id, ($$anchor, m) => {
						var div_38 = root_6();
						var node_20 = $.child(div_38);

						{
							var consequent_16 = ($$anchor) => {
								var img_4 = root_4();

								$.template_effect(() => {
									$.set_attribute(img_4, 'src', $.get(m).message?.img);
									$.set_attribute(img_4, 'alt', `img ${$.get(m).message?.updatedAt ?? ''}`);
								});

								$.append($$anchor, img_4);
							};

							$.if(node_20, ($$render) => {
								if ($.get(m).message?.img) $$render(consequent_16);
							});
						}

						var node_21 = $.sibling(node_20, 2);

						{
							var consequent_17 = ($$anchor) => {
								var div_39 = root_5();
								var div_40 = $.child(div_39);

								$.html(div_40, () => $.get(m).message?.message, true);
								$.reset(div_40);

								var div_41 = $.sibling(div_40, 2);
								var text_7 = $.only_child(div_41, true);

								$.reset(div_39);

								$.template_effect(
									($0, $1) => {
										$.set_class(div_39, 1, `max-w-[70%] rounded-md px-3 py-1.5 text-sm min-w-[${$0 ?? ''}px] flex flex-col border shadow
									${$.get(m).message?.from === messagesModule.me?.id ? 'bg-gray-50' : 'text-primary-700 bg-inherit'}`);

										$.set_class(div_40, 1, $.clsx($.get(m).message?.from == messagesModule.me?.id ? 'self-end' : 'self-start'));
										$.set_class(div_41, 1, `ml-auto text-xs text-gray-400 ${$.get(m).message?.from == messagesModule.me?.id ? 'self-end' : 'self-start'}`);
										$.set_text(text_7, $1);
									},
									[
										() => date($.get(m).message?.updatedAt).length + 10,
										() => date($.get(m).message?.updatedAt)
									]
								);

								$.append($$anchor, div_39);
							};

							$.if(node_21, ($$render) => {
								if ($.get(m).message?.message) $$render(consequent_17);
							});
						}

						$.reset(div_38);

						$.template_effect(() => $.set_class(div_38, 1, `flex w-full flex-col gap-0.5
							${$.get(m).message?.from == messagesModule.me?.id ? 'items-end justify-end' : 'items-start justify-start'}`));

						$.append($$anchor, div_38);
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_18, ($$render) => {
					if (messagesModule.selectedChat?.messages?.length) $$render(consequent_18);
				});
			}

			$.reset(div_37);
			$.bind_this(div_37, ($$value) => messagesModule.desktopScrollRef = $$value, () => messagesModule?.desktopScrollRef);

			var form_1 = $.sibling(div_37, 2);
			var node_22 = $.child(form_1);

			Textarea(node_22, {
				placeholder: 'Type a message',
				class: 'h-16 w-full bg-inherit py-3 pr-5 focus:outline-none',
				get value() {
					return messagesModule.newMessage.message;
				},

				set value($$value) {
					messagesModule.newMessage.message = $$value;
				}
			});

			$.next(2);
			$.reset(form_1);
			$.reset(div_36);

			$.event('submit', form_1, function (...$$args) {
				messagesModule.sendMessage?.apply(this, $$args);
			});

			$.append($$anchor, div_36);
		};

		var alternate_5 = ($$anchor) => {
			var div_42 = root_18();

			$.append($$anchor, div_42);
		};

		$.if(node_16, ($$render) => {
			if (messagesModule.loading) $$render(consequent_15); else if (messagesModule.selectedChat) $$render(consequent_19, 1); else $$render(alternate_5, -1);
		});
	}

	$.reset(div_34);
	$.reset(div_22);
	$.template_effect(() => $.set_text(text_5, `Chat (${messagesModule.chatsCount ?? ''})`));
	$.bind_value(input_1, () => messagesModule.searchValue, ($$value) => messagesModule.searchValue = $$value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);