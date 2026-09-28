import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { Avatar, Dialog } from "melt/builders";
import { flip } from "svelte/animate";
import { scale } from "svelte/transition";
import Close from "~icons/material-symbols/close-rounded";
import Trash from "~icons/tabler/trash";

const userProfile = ($$anchor, user = $.noop, a = $.noop) => {
	const avatar = $.derived(() => a() ?? new Avatar({ src: user().img }));
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var text = $.only_child(p, true);

	$.reset(div_1);

	var img = $.sibling(div_1, 2);

	$.attribute_effect(
		img,
		() => ({
			...$.get(avatar).image,
			alt: `${user().name}'s profile picture`,
			class: [
				"absolute inset-0 !block h-full w-full rounded-[inherit] object-cover",
				$.get(avatar).loadingStatus === "loaded" ? "fade-in" : "invisible"
			]
		}),
		void 0,
		void 0,
		void 0,
		'svelte-152tzhz'
	);

	$.reset(div);

	var p_1 = $.sibling(div, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, user().name[0]);
		$.set_text(text_1, user().name);
	});

	$.replay_events(img);
	$.append($$anchor, fragment);
};

var root = $.from_html(
	`<div class="relative flex size-32 items-center justify-center overflow-hidden rounded-full"><div class="grid h-full w-full place-items-center rounded-full border bg-neutral-300 text-5xl font-medium text-neutral-700
			dark:bg-neutral-800"><p> </p></div> <img/></div> <p class="mt-2 font-semibold text-gray-800 dark:text-gray-200"> </p>`,
	1
);

var root_1 = $.from_html(`<div class="group relative"><button class="rounded-xl bg-transparent px-4 py-2 transition-all
				hover:cursor-pointer hover:bg-gray-300/50
				active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
				dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50"><!></button> <button class="delete-btn absolute right-3 top-2 grid size-7 place-items-center rounded-full
					border border-red-200/50 bg-red-100/80 text-red-400
					opacity-0 shadow-sm backdrop-blur-sm
					transition-all duration-200
					hover:bg-red-200/90 hover:text-red-500 hover:shadow-md
					group-hover:opacity-100
					dark:border-red-400/20 dark:bg-red-500/20 dark:text-red-300
					dark:hover:bg-red-500/30 dark:hover:text-red-200"><!></button></div>`);

var root_2 = $.from_html(`<button><div class="relative flex size-32 items-center justify-center overflow-hidden rounded-full"><div class="grid h-full w-full place-items-center rounded-full border bg-neutral-300 text-5xl font-medium text-neutral-700
			dark:bg-neutral-800 dark:text-neutral-600"><p>+</p></div></div> <p class="mt-2 font-semibold text-gray-800 dark:text-gray-200">Add new</p></button>`);

var root_3 = $.from_html(`<div><!></div>`);

var root_4 = $.from_html(
	`<button><!> <p class="text-sm font-light dark:text-gray-400">change user?</p></button> <div></div> <dialog><!> <div></div> <dialog><div class="mb-4 flex items-center justify-between"><h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Add new user</h2> <button class="grid place-items-center rounded-lg bg-transparent p-1 text-gray-400
					transition-colors hover:bg-gray-100 hover:text-gray-600
					dark:hover:bg-gray-700 dark:hover:text-gray-200"><!></button></div> <form class="flex flex-col gap-4"><label class="flex flex-col gap-1.5"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span> <input type="text" name="name" required="" placeholder="Enter name..." class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900
						placeholder:text-gray-400
						focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20
						dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
						dark:placeholder:text-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400/20"/></label> <div class="mt-2 flex justify-end gap-3"><button type="button" class="rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700
						transition-all hover:cursor-pointer hover:bg-gray-200
						active:bg-gray-300
						dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500">Cancel</button> <button type="submit" class="rounded-xl bg-gray-600 px-4 py-2 font-medium text-white
						transition-all hover:cursor-pointer hover:bg-gray-500
						active:bg-gray-400
						dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600">Add User</button></div></form></dialog> <div></div> <dialog><div class="mb-4 flex items-center justify-between"><h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete user</h2> <button class="grid place-items-center rounded-lg bg-transparent p-1 text-gray-400
					transition-colors hover:bg-gray-100 hover:text-gray-600
					dark:hover:bg-gray-700 dark:hover:text-gray-200"><!></button></div> <hr class="mb-4 border-gray-200 dark:border-gray-700"/> <p class="text-gray-600 dark:text-gray-300">Are you sure you want to delete <span class="font-semibold"> </span>?</p> <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700
					transition-all hover:cursor-pointer hover:bg-gray-200
					active:bg-gray-300
					dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500">Cancel</button> <button type="button" class="rounded-xl bg-red-500 px-4 py-2 font-medium text-white
					transition-all hover:cursor-pointer hover:bg-red-600
					active:bg-red-700
					dark:bg-red-800 dark:hover:bg-red-700 dark:active:bg-red-800">Delete</button></div></dialog></dialog>`,
	1
);

export default function Dialog_1($$anchor, $$props) {
	$.push($$props, true);

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

	const users = $.proxy([
		{ name: "Thomas", img: "/previews/dialog/thomas.jpg" },
		{ name: "Invisigal", img: "/previews/dialog/invisigal.webp" },
		{ name: "Esquie", img: "/previews/dialog/esquie.png" },
		{ name: "Hornet", img: "/previews/dialog/hornet.jpg" },
		{ name: "Denji", img: "/previews/dialog/denji.jpg" }
	]);

	let curr = $.state(0);
	let userToDelete = $.state(null);

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_4();
			var button = $.first_child(fragment_2);

			$.attribute_effect(
				button,
				() => ({
					class: 'mx-auto block rounded-xl bg-transparent px-4 py-2\n		transition-all\n		hover:cursor-pointer hover:bg-gray-300/50\n		active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n		dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
					...dialog.trigger
				}),
				void 0,
				void 0,
				void 0,
				'svelte-152tzhz'
			);

			var node = $.child(button);

			userProfile(node, () => users[$.get(curr)]);
			$.next(2);
			$.reset(button);

			var div_2 = $.sibling(button, 2);

			$.attribute_effect(div_2, () => ({ ...dialog.overlay }), void 0, void 0, void 0, 'svelte-152tzhz');

			var dialog_1 = $.sibling(div_2, 2);

			$.attribute_effect(
				dialog_1,
				() => ({
					class: 'abs-center visibility:[hidden] pointer-events-none z-10 grid grid-cols-3 overflow-visible\n		rounded-2xl border bg-white p-4 shadow-xl backdrop-blur-lg\n		data-[open]:pointer-events-auto data-[open]:visible\n		dark:border-gray-700 dark:bg-gray-900/80',
					...dialog.content
				}),
				void 0,
				void 0,
				void 0,
				'svelte-152tzhz'
			);

			var node_1 = $.child(dialog_1);

			$.each(node_1, 27, () => [...users, null], (u) => u ? u.name : null, ($$anchor, u, i) => {
				var div_3 = root_3();
				var node_2 = $.child(div_3);

				{
					var consequent = ($$anchor) => {
						var div_4 = root_1();
						var button_1 = $.child(div_4);
						var node_3 = $.child(button_1);

						userProfile(node_3, () => $.get(u));
						$.reset(button_1);

						var button_2 = $.sibling(button_1, 2);
						var node_4 = $.child(button_2);

						Trash(node_4, { class: 'size-3.5' });
						$.reset(button_2);
						$.reset(div_4);

						$.delegated('click', button_1, () => {
							$.set(curr, $.get(i), true);
							dialog.open = false;
						});

						$.delegated('click', button_2, (e) => {
							e.stopPropagation();
							$.set(userToDelete, { index: $.get(i), user: $.get(u) }, true);
							deleteDialog.open = true;
						});

						$.append($$anchor, div_4);
					};

					var alternate = ($$anchor) => {
						var button_3 = root_2();

						$.attribute_effect(
							button_3,
							() => ({
								class: 'rounded-xl bg-transparent px-4 py-2 transition-all\n	hover:cursor-pointer hover:bg-gray-300/50\n	active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n	dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
								...formDialog.trigger
							}),
							void 0,
							void 0,
							void 0,
							'svelte-152tzhz'
						);

						$.append($$anchor, button_3);
					};

					$.if(node_2, ($$render) => {
						if ($.get(u)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div_3);
				$.animation(div_3, () => flip, () => ({ duration: 250, delay: 500 }));
				$.transition(2, div_3, () => scale, () => ({ duration: 500, delay: 100 }));
				$.append($$anchor, div_3);
			});

			var div_5 = $.sibling(node_1, 2);

			$.attribute_effect(div_5, () => ({ ...formDialog.overlay }), void 0, void 0, void 0, 'svelte-152tzhz');

			var dialog_2 = $.sibling(div_5, 2);

			$.attribute_effect(
				dialog_2,
				() => ({
					class: 'abs-center visibility:[hidden] pointer-events-none z-10 w-96 overflow-visible\n		rounded-2xl border bg-white p-6 shadow-xl backdrop-blur-lg\n		data-[open]:pointer-events-auto data-[open]:visible\n		dark:border-gray-700 dark:bg-gray-900/80',
					...formDialog.content
				}),
				void 0,
				void 0,
				void 0,
				'svelte-152tzhz'
			);

			var div_6 = $.child(dialog_2);
			var button_4 = $.sibling($.child(div_6), 2);
			var node_5 = $.child(button_4);

			Close(node_5, { class: 'size-5' });
			$.reset(button_4);
			$.reset(div_6);

			var form = $.sibling(div_6, 2);
			var div_7 = $.sibling($.child(form), 2);
			var button_5 = $.child(div_7);

			$.next(2);
			$.reset(div_7);
			$.reset(form);
			$.reset(dialog_2);

			var div_8 = $.sibling(dialog_2, 2);

			$.attribute_effect(div_8, () => ({ ...deleteDialog.overlay }), void 0, void 0, void 0, 'svelte-152tzhz');

			var dialog_3 = $.sibling(div_8, 2);

			$.attribute_effect(
				dialog_3,
				() => ({
					class: 'abs-center visibility:[hidden] w-128 pointer-events-none z-10 overflow-visible\n			rounded-2xl border bg-white p-6 shadow-xl backdrop-blur-lg\n			data-[open]:pointer-events-auto data-[open]:visible\n			dark:border-gray-700 dark:bg-gray-900/80',
					...deleteDialog.content
				}),
				void 0,
				void 0,
				void 0,
				'svelte-152tzhz'
			);

			var div_9 = $.child(dialog_3);
			var button_6 = $.sibling($.child(div_9), 2);
			var node_6 = $.child(button_6);

			Close(node_6, { class: 'size-5' });
			$.reset(button_6);
			$.reset(div_9);

			var p_2 = $.sibling(div_9, 4);
			var span = $.sibling($.child(p_2));
			var text_2 = $.only_child(span, true);

			$.next();
			$.reset(p_2);

			var div_10 = $.sibling(p_2, 2);
			var button_7 = $.child(div_10);
			var button_8 = $.sibling(button_7, 2);

			$.reset(div_10);
			$.reset(dialog_3);
			$.reset(dialog_1);
			$.template_effect(() => $.set_text(text_2, $.get(userToDelete)?.user.name));
			$.delegated('click', button_4, () => formDialog.open = false);

			$.event('submit', form, (e) => {
				e.preventDefault();

				const formData = new FormData(e.currentTarget);
				const name = formData.get("name");

				if (!name.trim()) return;

				users.push({ name: name.trim() });
				formDialog.open = false;
				e.currentTarget.reset();
			});

			$.delegated('click', button_5, () => formDialog.open = false);
			$.delegated('click', button_6, () => deleteDialog.open = false);
			$.delegated('click', button_7, () => deleteDialog.open = false);

			$.delegated('click', button_8, () => {
				if ($.get(userToDelete)) {
					users.splice($.get(userToDelete).index, 1);

					if ($.get(curr) >= users.length) $.set(curr, Math.max(0, users.length - 1), true);

					$.set(userToDelete, null);
				}

				deleteDialog.open = false;
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);