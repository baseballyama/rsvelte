import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { Avatar, Dialog } from "melt/builders";
import { flip } from "svelte/animate";
import { scale } from "svelte/transition";
import Close from "~icons/material-symbols/close-rounded";
import Trash from "~icons/tabler/trash";

function userProfile($$renderer, user, a) {
	const avatar = a ?? new Avatar({ src: user.img });

	$$renderer.push(`<div class="relative flex size-32 items-center justify-center overflow-hidden rounded-full"><div class="grid h-full w-full place-items-center rounded-full border bg-neutral-300 text-5xl font-medium text-neutral-700 dark:bg-neutral-800"><p>${$.escape(user.name[0])}</p></div> <img${$.attributes(
		{
			...avatar.image,
			alt: `${user.name}'s profile picture`,
			class: $.clsx([
				"absolute inset-0 !block h-full w-full rounded-[inherit] object-cover",
				avatar.loadingStatus === "loaded" ? "fade-in" : "invisible"
			])
		},
		'svelte-152tzhz'
	)} onload="this.__e=event" onerror="this.__e=event"/></div> <p class="mt-2 font-semibold text-gray-800 dark:text-gray-200">${$.escape(user.name)}</p>`);
}

export default function Dialog_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			scrollLock: { type: "boolean", defaultValue: true, label: "Scroll Lock" },
			closeOnEscape: {
				type: "boolean",
				defaultValue: true,
				label: "Close on Escape"
			},
			closeOnOutsideClick: {
				type: "boolean",
				defaultValue: true,
				label: "Close on Outside Click"
			}
		});

		const dialog = new Dialog({
			scrollLock: () => controls.scrollLock,
			closeOnEscape: () => controls.closeOnEscape,
			closeOnOutsideClick: () => controls.closeOnOutsideClick
		});

		const formDialog = new Dialog({
			scrollLock: () => controls.scrollLock,
			closeOnEscape: () => controls.closeOnEscape,
			closeOnOutsideClick: () => controls.closeOnOutsideClick
		});

		const deleteDialog = new Dialog({
			scrollLock: () => controls.scrollLock,
			closeOnEscape: () => controls.closeOnEscape,
			closeOnOutsideClick: () => controls.closeOnOutsideClick
		});

		const users = [
			{ name: "Thomas", img: "/previews/dialog/thomas.jpg" },
			{ name: "Invisigal", img: "/previews/dialog/invisigal.webp" },
			{ name: "Esquie", img: "/previews/dialog/esquie.png" },
			{ name: "Hornet", img: "/previews/dialog/hornet.jpg" },
			{ name: "Denji", img: "/previews/dialog/denji.jpg" }
		];

		let curr = 0;
		let userToDelete = null;

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<button${$.attributes(
					{
						class: 'mx-auto block rounded-xl bg-transparent px-4 py-2 transition-all hover:cursor-pointer hover:bg-gray-300/50 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
						...dialog.trigger
					},
					'svelte-152tzhz'
				)}>`);

				userProfile($$renderer, users[curr]);

				$$renderer.push(`<!----> <p class="text-sm font-light dark:text-gray-400">change user?</p></button> <div${$.attributes({ ...dialog.overlay }, 'svelte-152tzhz')}></div> <dialog${$.attributes(
					{
						class: 'abs-center visibility:[hidden] pointer-events-none z-10 grid grid-cols-3 overflow-visible rounded-2xl border bg-white p-4 shadow-xl backdrop-blur-lg data-[open]:pointer-events-auto data-[open]:visible dark:border-gray-700 dark:bg-gray-900/80',
						...dialog.content
					},
					'svelte-152tzhz'
				)}><!--[-->`);

				const each_array = $.ensure_array_like([...users, null]);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let u = each_array[i];

					$$renderer.push(`<div>`);

					if (u) {
						$$renderer.push(`<!--[0--><div class="group relative"><button class="rounded-xl bg-transparent px-4 py-2 transition-all hover:cursor-pointer hover:bg-gray-300/50 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50">`);
						userProfile($$renderer, u);
						$$renderer.push(`<!----></button> <button class="delete-btn absolute right-3 top-2 grid size-7 place-items-center rounded-full border border-red-200/50 bg-red-100/80 text-red-400 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-red-200/90 hover:text-red-500 hover:shadow-md group-hover:opacity-100 dark:border-red-400/20 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 dark:hover:text-red-200">`);
						Trash($$renderer, { class: 'size-3.5' });
						$$renderer.push(`<!----></button></div>`);
					} else {
						$$renderer.push(`<!--[-1--><button${$.attributes(
							{
								class: 'rounded-xl bg-transparent px-4 py-2 transition-all hover:cursor-pointer hover:bg-gray-300/50 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
								...formDialog.trigger
							},
							'svelte-152tzhz'
						)}><div class="relative flex size-32 items-center justify-center overflow-hidden rounded-full"><div class="grid h-full w-full place-items-center rounded-full border bg-neutral-300 text-5xl font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-600"><p>+</p></div></div> <p class="mt-2 font-semibold text-gray-800 dark:text-gray-200">Add new</p></button>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--> <div${$.attributes({ ...formDialog.overlay }, 'svelte-152tzhz')}></div> <dialog${$.attributes(
					{
						class: 'abs-center visibility:[hidden] pointer-events-none z-10 w-96 overflow-visible rounded-2xl border bg-white p-6 shadow-xl backdrop-blur-lg data-[open]:pointer-events-auto data-[open]:visible dark:border-gray-700 dark:bg-gray-900/80',
						...formDialog.content
					},
					'svelte-152tzhz'
				)}><div class="mb-4 flex items-center justify-between"><h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Add new user</h2> <button class="grid place-items-center rounded-lg bg-transparent p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200">`);

				Close($$renderer, { class: 'size-5' });

				$$renderer.push(`<!----></button></div> <form class="flex flex-col gap-4"><label class="flex flex-col gap-1.5"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span> <input type="text" name="name" required="" placeholder="Enter name..." class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"/></label> <div class="mt-2 flex justify-end gap-3"><button type="button" class="rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-all hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500">Cancel</button> <button type="submit" class="rounded-xl bg-gray-600 px-4 py-2 font-medium text-white transition-all hover:cursor-pointer hover:bg-gray-500 active:bg-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600">Add User</button></div></form></dialog> <div${$.attributes({ ...deleteDialog.overlay }, 'svelte-152tzhz')}></div> <dialog${$.attributes(
					{
						class: 'abs-center visibility:[hidden] w-128 pointer-events-none z-10 overflow-visible rounded-2xl border bg-white p-6 shadow-xl backdrop-blur-lg data-[open]:pointer-events-auto data-[open]:visible dark:border-gray-700 dark:bg-gray-900/80',
						...deleteDialog.content
					},
					'svelte-152tzhz'
				)}><div class="mb-4 flex items-center justify-between"><h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete user</h2> <button class="grid place-items-center rounded-lg bg-transparent p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200">`);

				Close($$renderer, { class: 'size-5' });
				$$renderer.push(`<!----></button></div> <hr class="mb-4 border-gray-200 dark:border-gray-700"/> <p class="text-gray-600 dark:text-gray-300">Are you sure you want to delete <span class="font-semibold">${$.escape(userToDelete?.user.name)}</span>?</p> <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-all hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500">Cancel</button> <button type="button" class="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition-all hover:cursor-pointer hover:bg-red-600 active:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700 dark:active:bg-red-800">Delete</button></div></dialog></dialog>`);
			},
			$$slots: { default: true }
		});
	});
}