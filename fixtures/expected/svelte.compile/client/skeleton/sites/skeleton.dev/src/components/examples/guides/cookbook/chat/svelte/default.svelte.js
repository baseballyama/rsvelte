import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SendIcon from '@lucide/svelte/icons/send';
import { onMount } from 'svelte';

var root = $.from_html(`<button type="button"><span class="flex-1 text-start"> </span></button>`);
var root_1 = $.from_html(`<div class="grid grid-cols-[auto_1fr] gap-2"><div class="card p-4 preset-tonal rounded-tl-none space-y-2"><header class="flex justify-between items-center"><p class="font-bold"> </p> <small class="opacity-50"> </small></header> <p> </p></div></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-[1fr_auto] gap-2"><div><header class="flex justify-between items-center"><p class="font-bold"> </p> <small class="opacity-50"> </small></header> <p> </p></div></div>`);
var root_3 = $.from_html(`<section class="card bg-surface-100-900 rounded-container overflow-hidden"><div class="chat w-full h-full grid grid-cols-1 lg:grid-cols-[30%_1fr]"><div class="hidden lg:grid grid-rows-[auto_1fr_auto] border-r-[1px] border-surface-200-800"><header class="border-b-[1px] border-surface-200-800 p-4"><input class="input" type="search" placeholder="Search..."/></header> <div class="p-4 space-y-4 overflow-y-auto"><small class="opacity-50">Contacts</small> <div class="flex flex-col space-y-1"></div></div></div> <div class="grid grid-rows-[1fr_auto]"><section class="max-h-[500px] p-4 overflow-y-auto space-y-4"></section> <section class="border-t-[1px] border-surface-200-800 p-4"><div class="input-group grid-cols-[auto_1fr_auto] divide-x divide-surface-200-800 rounded-container-token"><button class="input-group-cell preset-tonal">+</button> <textarea class="bg-transparent border-0 ring-0" name="prompt" id="prompt" placeholder="Write a message..." rows="1"></textarea> <button><!></button></div></section></div></div></section>`);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	// Types
	let elemChat;

	const lorem = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Provident blanditiis quidem dolorum ab similique. Voluptatibus quibusdam unde mollitia corrupti assumenda libero. Quibusdam culpa illum unde asperiores accusantium! Unde, cupiditate tenetur.';

	// Navigation List
	const people = [
		{ id: 0, avatar: 14, name: 'Michael' },
		{ id: 1, avatar: 40, name: 'Janet' },
		{ id: 2, avatar: 31, name: 'Susan' },
		{ id: 3, avatar: 56, name: 'Joey' },
		{ id: 4, avatar: 24, name: 'Lara' },
		{ id: 5, avatar: 9, name: 'Melissa' }
	];

	let currentPersonId = people[0].id;

	// Messages
	let messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: lorem,
			color: 'preset-tonal-primary'
		},

		{
			id: 1,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: lorem,
			color: 'preset-tonal-primary'
		},

		{
			id: 2,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:50pm',
			message: lorem,
			color: 'preset-tonal-primary'
		},

		{
			id: 3,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:52pm',
			message: lorem,
			color: 'preset-tonal-primary'
		}
	];

	let currentMessage = '';

	function scrollChatBottom(behavior) {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function getCurrentTimestamp() {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}

	function addMessage() {
		const newMessage = {
			id: messageFeed.length,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: `Today @ ${getCurrentTimestamp()}`,
			message: currentMessage,
			color: 'preset-tonal-primary'
		};

		// Update the message feed
		messageFeed = [...messageFeed, newMessage];

		// Clear prompt
		currentMessage = '';

		// Smooth scroll to bottom
		// Timeout prevents race condition
		setTimeout(() => scrollChatBottom('smooth'), 0);
	}

	function onPromptKeydown(event) {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			addMessage();
		}
	}

	// When DOM is mounted, scroll to bottom
	onMount(() => {
		scrollChatBottom();
	});

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.sibling($.child(div_2), 2);

	$.each(div_3, 21, () => people, (person) => person.id, ($$anchor, person) => {
		var button = root();
		var span = $.child(button);
		var text = $.only_child(span, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `card p-2 w-full flex items-center space-x-4 ${$.get(person).id === currentPersonId
				? 'preset-filled-primary-500'
				: 'bg-surface-hover-token'}`);

			$.set_text(text, $.get(person).name);
		});

		$.delegated('click', button, () => currentPersonId = $.get(person).id);
		$.append($$anchor, button);
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var section_1 = $.child(div_4);

	$.each(section_1, 21, () => messageFeed, (bubble) => bubble.id, ($$anchor, bubble) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div_5 = root_1();
				var div_6 = $.child(div_5);
				var header = $.child(div_6);
				var p = $.child(header);
				var text_1 = $.only_child(p, true);
				var small = $.sibling(p, 2);
				var text_2 = $.only_child(small, true);

				$.reset(header);

				var p_1 = $.sibling(header, 2);
				var text_3 = $.only_child(p_1, true);

				$.reset(div_6);
				$.reset(div_5);

				$.template_effect(() => {
					$.set_text(text_1, $.get(bubble).name);
					$.set_text(text_2, $.get(bubble).timestamp);
					$.set_text(text_3, $.get(bubble).message);
				});

				$.append($$anchor, div_5);
			};

			var alternate = ($$anchor) => {
				var div_7 = root_2();
				var div_8 = $.child(div_7);
				var header_1 = $.child(div_8);
				var p_2 = $.child(header_1);
				var text_4 = $.only_child(p_2, true);
				var small_1 = $.sibling(p_2, 2);
				var text_5 = $.only_child(small_1, true);

				$.reset(header_1);

				var p_3 = $.sibling(header_1, 2);
				var text_6 = $.only_child(p_3, true);

				$.reset(div_8);
				$.reset(div_7);

				$.template_effect(() => {
					$.set_class(div_8, 1, `card p-4 rounded-tr-none space-y-2 ${$.get(bubble).color ?? ''}`);
					$.set_text(text_4, $.get(bubble).name);
					$.set_text(text_5, $.get(bubble).timestamp);
					$.set_text(text_6, $.get(bubble).message);
				});

				$.append($$anchor, div_7);
			};

			$.if(node, ($$render) => {
				if ($.get(bubble).host === true) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(section_1);
	$.bind_this(section_1, ($$value) => elemChat = $$value, () => elemChat);

	var section_2 = $.sibling(section_1, 2);
	var div_9 = $.child(section_2);
	var textarea = $.sibling($.child(div_9), 2);

	$.remove_textarea_child(textarea);

	var button_1 = $.sibling(textarea, 2);
	var node_1 = $.child(button_1);

	SendIcon(node_1, {});
	$.reset(button_1);
	$.reset(div_9);
	$.reset(section_2);
	$.reset(div_4);
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_value(textarea, currentMessage);
		$.set_class(button_1, 1, `input-group-cell ${currentMessage ? 'preset-filled-primary-500' : 'preset-tonal'}`);
	});

	$.delegated('input', textarea, (e) => currentMessage = e.currentTarget.value);
	$.delegated('keydown', textarea, onPromptKeydown);
	$.delegated('click', button_1, addMessage);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click', 'input', 'keydown']);