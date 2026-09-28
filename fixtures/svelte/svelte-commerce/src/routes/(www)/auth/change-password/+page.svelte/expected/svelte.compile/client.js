import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input/input.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { ChangePasswordModule } from '$lib/core/composables/index.js';
import { Lock, KeyRound, Eye, EyeOff } from '@lucide/svelte';

var root = $.from_html(`<p class="mt-1 text-sm text-red-500"> </p>`);
var root_1 = $.from_html(`<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>`);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><div class="w-full max-w-md transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="text-center"><div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><!></div> <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h1> <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Please enter your old password and choose a new one</p></div> <form class="space-y-4"><div><label for="old" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Old Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><!></div> <!> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"><!></button></div> <!></div> <div><label for="password" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><!></div> <!> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"><!></button></div> <!></div> <div><label for="retype" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><!></div> <!> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"><!></button></div> <!></div> <!></form></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const changePasswordModule = new ChangePasswordModule();
	var div = root_3();

	$.head('157xwrt', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Change Password';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	KeyRound(node, { class: 'h-6 w-6 text-primary' });
	$.reset(div_3);
	$.next(4);
	$.reset(div_2);

	var form = $.sibling(div_2, 2);
	var div_4 = $.child(form);
	var div_5 = $.sibling($.child(div_4), 2);
	var div_6 = $.child(div_5);
	var node_1 = $.child(div_6);

	Lock(node_1, { class: 'h-5 w-5 text-gray-400' });
	$.reset(div_6);

	var node_2 = $.sibling(div_6, 2);

	{
		let $0 = $.derived(() => changePasswordModule.showOld ? 'text' : 'password');

		Input(node_2, {
			id: 'old',
			get type() {
				return $.get($0);
			},
			name: 'old',
			placeholder: 'Enter your current password',
			required: true,
			class: 'pl-10 pr-10',
			get value() {
				return changePasswordModule.old;
			},

			set value($$value) {
				changePasswordModule.old = $$value;
			}
		});
	}

	var button = $.sibling(node_2, 2);
	var node_3 = $.child(button);

	{
		var consequent = ($$anchor) => {
			EyeOff($$anchor, { class: 'h-5 w-5' });
		};

		var alternate = ($$anchor) => {
			Eye($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node_3, ($$render) => {
			if (changePasswordModule.showOld) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_5);

	var node_4 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, changePasswordModule.errors.old));
			$.append($$anchor, p);
		};

		$.if(node_4, ($$render) => {
			if (changePasswordModule.errors.old && changePasswordModule.old.length > 0) $$render(consequent_1);
		});
	}

	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var div_9 = $.child(div_8);
	var node_5 = $.child(div_9);

	Lock(node_5, { class: 'h-5 w-5 text-gray-400' });
	$.reset(div_9);

	var node_6 = $.sibling(div_9, 2);

	{
		let $0 = $.derived(() => changePasswordModule.showNew ? 'text' : 'password');

		Input(node_6, {
			id: 'password',
			get type() {
				return $.get($0);
			},
			name: 'password',
			placeholder: 'Enter your new password',
			required: true,
			class: 'pl-10 pr-10',
			get value() {
				return changePasswordModule.password;
			},

			set value($$value) {
				changePasswordModule.password = $$value;
			}
		});
	}

	var button_1 = $.sibling(node_6, 2);
	var node_7 = $.child(button_1);

	{
		var consequent_2 = ($$anchor) => {
			EyeOff($$anchor, { class: 'h-5 w-5' });
		};

		var alternate_1 = ($$anchor) => {
			Eye($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node_7, ($$render) => {
			if (changePasswordModule.showNew) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_8);

	var node_8 = $.sibling(div_8, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, changePasswordModule.errors.password));
			$.append($$anchor, p_1);
		};

		$.if(node_8, ($$render) => {
			if (changePasswordModule.errors.password && changePasswordModule.password.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div_7);

	var div_10 = $.sibling(div_7, 2);
	var div_11 = $.sibling($.child(div_10), 2);
	var div_12 = $.child(div_11);
	var node_9 = $.child(div_12);

	Lock(node_9, { class: 'h-5 w-5 text-gray-400' });
	$.reset(div_12);

	var node_10 = $.sibling(div_12, 2);

	{
		let $0 = $.derived(() => changePasswordModule.showRetype ? 'text' : 'password');

		Input(node_10, {
			id: 'retype',
			get type() {
				return $.get($0);
			},
			name: 'retype',
			placeholder: 'Confirm your new password',
			required: true,
			class: 'pl-10 pr-10',
			get value() {
				return changePasswordModule.retype;
			},

			set value($$value) {
				changePasswordModule.retype = $$value;
			}
		});
	}

	var button_2 = $.sibling(node_10, 2);
	var node_11 = $.child(button_2);

	{
		var consequent_4 = ($$anchor) => {
			EyeOff($$anchor, { class: 'h-5 w-5' });
		};

		var alternate_2 = ($$anchor) => {
			Eye($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node_11, ($$render) => {
			if (changePasswordModule.showRetype) $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(button_2);
	$.reset(div_11);

	var node_12 = $.sibling(div_11, 2);

	{
		var consequent_5 = ($$anchor) => {
			var p_2 = root();
			var text_2 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_2, changePasswordModule.errors.retype));
			$.append($$anchor, p_2);
		};

		$.if(node_12, ($$render) => {
			if (changePasswordModule.errors.retype && changePasswordModule.retype.length > 0) $$render(consequent_5);
		});
	}

	$.reset(div_10);

	var node_13 = $.sibling(div_10, 2);

	{
		let $0 = $.derived(() => !changePasswordModule.isValid || changePasswordModule.loading);

		Button(node_13, {
			type: 'submit',
			class: 'w-full',
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();
				var node_14 = $.first_child(fragment_6);

				{
					var consequent_6 = ($$anchor) => {
						var div_13 = root_1();

						$.append($$anchor, div_13);
					};

					$.if(node_14, ($$render) => {
						if (changePasswordModule.loading) $$render(consequent_6);
					});
				}

				var text_3 = $.sibling(node_14);

				$.template_effect(() => $.set_text(text_3, ` ${changePasswordModule.loading ? 'Changing Password...' : 'Change Password'}`));
				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	}

	$.reset(form);
	$.reset(div_1);
	$.reset(div);

	$.event('submit', form, (e) => {
		// The composable's handler takes no event, so stop the native GET submit here —
		// otherwise the passwords end up in the URL, history and referrer.
		e.preventDefault();

		changePasswordModule.handleSubmit();
	});

	$.delegated('click', button, () => changePasswordModule.showOld = !changePasswordModule.showOld);
	$.delegated('click', button_1, () => changePasswordModule.showNew = !changePasswordModule.showNew);
	$.delegated('click', button_2, () => changePasswordModule.showRetype = !changePasswordModule.showRetype);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);