import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button/button.svelte';
import { userService } from '$lib/core/services/index.js';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { toast } from '@misiki/kitcommerce-core';

import {
	Save,
	ArrowLeft,
	InfoIcon,
	Loader,
	FileChartColumnIncreasing,
	AlertCircle
} from '@lucide/svelte';

import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';

var root = $.from_html(`<div class="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert"><!> <span> </span></div>`);
var root_1 = $.from_html(`<!> Update Profile`, 1);
var root_2 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-md transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="space-y-2 text-center"><p class="text-gray-500 dark:text-gray-400">Update Profile Details</p></div> <!> <form class="grid grid-cols-2 gap-4"><div class="col-span-2"><h2 class="text-1xl font-bold text-gray-900 dark:text-white">Avatar:</h2> <div class="mt-3 flex w-full flex-row items-center justify-start"><!></div></div> <!> <!> <!> <!> <div class="col-span-2"><!></div></form></div></div> <div class="ease-[cubic-bezier(1,.32,.52,.67)] fixed left-0 right-0 top-10 z-50 mx-auto flex w-1/2 max-w-[1000px] flex-row justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs font-semibold text-black shadow transition-all duration-150 hover:bg-gray-100"><div class="flex flex-row items-center gap-2"><!> <span>Unsaved changes</span></div> <button class="rounded bg-white px-2 py-1 text-xs text-black shadow"><!></button></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let user = $.state($.proxy({}));
	let isLoading = $.state(false);
	let detailsChanged = $.state(false);
	let loadError = $.state('');

	const schemas = {
		firstName: z.string().min(2, 'First name must be at least 2 characters'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters'),
		email: z.string().email('Please enter a valid email address'),
		phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number').min(9, 'Please enter a valid phone number')
	};

	const loadUser = async () => {
		try {
			$.set(user, await userService.getMe(), true);
		} catch(e) {
			$.set(loadError, e?.message || 'Could not load your profile. Please sign in and try again.', true);
		}
	};

	$.user_effect(() => {
		loadUser();
	});

	// Ctrl/Cmd+S saves the profile — scoped to this page. Assigning document.onkeydown
	// leaked the handler across every later client-side navigation, so register and
	// tear down properly instead.
	$.user_effect(() => {
		const onKeydown = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 's') {
				e.preventDefault();
				e.stopPropagation();
				handleUpdate();
			}
		};

		document.addEventListener('keydown', onKeydown);

		return () => document.removeEventListener('keydown', onKeydown);
	});

	const handleUpdate = async () => {
		try {
			$.set(isLoading, true);
			$.set(user, await userService.updateProfile($.get(user)), true);
			goto('/profile');
		} catch(e) {
			toast.error(e.message);
		} finally {
			$.set(isLoading, false);
			$.set(detailsChanged, false);
		}
	};

	const handleDetailsChange = () => {
		$.set(detailsChanged, true);
	};

	const onUploadComplete = (urls) => {
		$.get(user).avatar = urls[0];
		handleDetailsChange();
	};

	var fragment = root_2();

	$.head('1eupaib', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Profile';
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			AlertCircle(node_1, { class: 'h-4 w-4 shrink-0' });

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(div_2);
			$.template_effect(() => $.set_text(text, $.get(loadError)));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(loadError)) $$render(consequent);
		});
	}

	var form = $.sibling(node, 2);
	var div_3 = $.child(form);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_2 = $.child(div_4);

	LazyImg(node_2, {
		get src() {
			return $.get(user).avatar;
		},
		alt: `Avatar Image`,
		width: 70,
		height: 70,
		class: 'ml-5 rounded-lg'
	});

	$.reset(div_4);
	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	Textbox(node_3, {
		name: 'firstName',
		placeholder: 'Enter Your First Name',
		get schema() {
			return schemas.firstName;
		},
		label: 'First Name',
		required: true,
		get value() {
			return $.get(user).firstName;
		},

		set value($$value) {
			$.get(user).firstName = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Textbox(node_4, {
		name: 'lastName',
		placeholder: 'Enter Your Last Name',
		get schema() {
			return schemas.lastName;
		},
		label: 'Last Name',
		required: true,
		get value() {
			return $.get(user).lastName;
		},

		set value($$value) {
			$.get(user).lastName = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Textbox(node_5, {
		name: 'email',
		type: 'email',
		placeholder: 'Enter Your Email',
		get schema() {
			return schemas.email;
		},
		label: 'Email',
		required: true,
		get value() {
			return $.get(user).email;
		},

		set value($$value) {
			$.get(user).email = $$value;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Textbox(node_6, {
		name: 'phone',
		type: 'tel',
		placeholder: '+1234567890',
		get schema() {
			return schemas.phone;
		},
		label: 'Phone',
		required: true,
		get value() {
			return $.get(user).phone;
		},

		set value($$value) {
			$.get(user).phone = $$value;
		}
	});

	var div_5 = $.sibling(node_6, 2);
	var node_7 = $.child(div_5);

	Button(node_7, {
		get disabled() {
			return $.get(isLoading);
		},
		onclick: handleUpdate,
		type: 'submit',
		class: 'flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_8 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					Loader($$anchor, { class: 'mr-2 h-4 w-4 animate-spin' });
				};

				$.if(node_8, ($$render) => {
					if ($.get(isLoading)) $$render(consequent_1);
				});
			}

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(form);
	$.reset(div_1);
	$.reset(div);

	var div_6 = $.sibling(div, 2);
	var div_7 = $.child(div_6);
	var node_9 = $.child(div_7);

	InfoIcon(node_9, { class: 'h-4 w-4' });
	$.next(2);
	$.reset(div_7);

	var button = $.sibling(div_7, 2);
	var node_10 = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Save');

			$.append($$anchor, text_1);
		};

		$.if(node_10, ($$render) => {
			if ($.get(isLoading)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_6);
	$.template_effect(() => $.set_style(div_6, $.get(detailsChanged) ? 'display: flex' : 'display: none'));
	$.event('submit', form, handleUpdate);
	$.delegated('input', form, handleDetailsChange);
	$.delegated('click', button, handleUpdate);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input', 'click']);