import * as $ from 'svelte/internal/server';
import SendIcon from '@lucide/svelte/icons/send';
import { onMount } from 'svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<section class="card bg-surface-100-900 rounded-container overflow-hidden"><div class="chat w-full h-full grid grid-cols-1 lg:grid-cols-[30%_1fr]"><div class="hidden lg:grid grid-rows-[auto_1fr_auto] border-r-[1px] border-surface-200-800"><header class="border-b-[1px] border-surface-200-800 p-4"><input class="input" type="search" placeholder="Search..."/></header> <div class="p-4 space-y-4 overflow-y-auto"><small class="opacity-50">Contacts</small> <div class="flex flex-col space-y-1"><!--[-->`);

		const each_array = $.ensure_array_like(people);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let person = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class(`card p-2 w-full flex items-center space-x-4 ${person.id === currentPersonId
				? 'preset-filled-primary-500'
				: 'bg-surface-hover-token'}`)}><span class="flex-1 text-start">${$.escape(person.name)}</span></button>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="grid grid-rows-[1fr_auto]"><section class="max-h-[500px] p-4 overflow-y-auto space-y-4"><!--[-->`);

		const each_array_1 = $.ensure_array_like(messageFeed);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let bubble = each_array_1[$$index_1];

			if (bubble.host === true) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-[auto_1fr] gap-2"><div class="card p-4 preset-tonal rounded-tl-none space-y-2"><header class="flex justify-between items-center"><p class="font-bold">${$.escape(bubble.name)}</p> <small class="opacity-50">${$.escape(bubble.timestamp)}</small></header> <p>${$.escape(bubble.message)}</p></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="grid grid-cols-[1fr_auto] gap-2"><div${$.attr_class(`card p-4 rounded-tr-none space-y-2 ${$.stringify(bubble.color)}`)}><header class="flex justify-between items-center"><p class="font-bold">${$.escape(bubble.name)}</p> <small class="opacity-50">${$.escape(bubble.timestamp)}</small></header> <p>${$.escape(bubble.message)}</p></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></section> <section class="border-t-[1px] border-surface-200-800 p-4"><div class="input-group grid-cols-[auto_1fr_auto] divide-x divide-surface-200-800 rounded-container-token"><button class="input-group-cell preset-tonal">+</button> <textarea class="bg-transparent border-0 ring-0" name="prompt" id="prompt" placeholder="Write a message..." rows="1">`);

		const $$body = $.escape(currentMessage);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <button${$.attr_class(`input-group-cell ${currentMessage ? 'preset-filled-primary-500' : 'preset-tonal'}`)}>`);
		SendIcon($$renderer, {});
		$$renderer.push(`<!----></button></div></section></div></div></section>`);
	});
}