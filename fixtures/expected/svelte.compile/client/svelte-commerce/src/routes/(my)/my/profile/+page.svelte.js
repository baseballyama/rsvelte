import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/form/textbox.svelte';
import { Button } from '$lib/components/ui/button';

import {
	Save,
	ArrowLeft,
	InfoIcon,
	Loader,
	User,
	Mail,
	Phone,
	Trash2,
	AlertCircle
} from '@lucide/svelte';

import { goto } from '$app/navigation';
import { MyProfileModule } from '$lib/core/composables/index.js';
import { fly, fade } from 'svelte/transition';

var root = $.from_html(`<!> Saving...`, 1);
var root_1 = $.from_html(`<!> Save Changes`, 1);
var root_2 = $.from_html(`<div class="fixed bottom-8 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4"><div class="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md"><div class="flex items-center gap-3 px-2"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><!></div> <span class="text-sm font-semibold text-gray-900">Unsaved changes</span></div> <!></div></div>`);
var root_3 = $.from_html(`<div class="mx-auto max-w-6xl md:py-8 md:py-12"><div class="space-y-10"><div class="flex items-center justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Profile Settings</h1> <p class="mt-2 text-sm text-gray-500">Manage your personal information and account security.</p></div></div> <div class="overflow-hidden bg-white"><div><form class="space-y-8"><div class="grid grid-cols-1 gap-8 md:grid-cols-2"><div class="space-y-2"><!></div> <div class="space-y-2"><!></div> <div class="space-y-2"><!></div> <div class="space-y-2"><!></div></div></form></div></div> <div class="overflow-hidden rounded-md border border-red-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]"><div class="border-b border-red-50 bg-red-50/30 p-6 md:p-8"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600"><!></div> <h2 class="text-xl font-bold text-red-600">Danger Zone</h2></div></div> <div class="p-6 md:p-8"><div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div class="max-w-md"><h3 class="text-lg font-bold text-gray-900">Delete Account</h3> <p class="mt-1 text-sm text-gray-500">Permanently delete your account and all associated data. This action cannot be undone.</p></div> <!></div></div></div></div></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const profileModule = new MyProfileModule();
	var fragment = root_3();

	$.head('17xl71t', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'My Profile | Svelte Commerce';
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var form = $.child(div_3);
	var div_4 = $.child(form);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	Input(node, {
		label: 'First Name',
		placeholder: 'Enter first name',
		class: 'h-12',
		get value() {
			return profileModule.profile.firstName;
		},

		set value($$value) {
			profileModule.profile.firstName = $$value;
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_1 = $.child(div_6);

	Input(node_1, {
		label: 'Last Name',
		placeholder: 'Enter last name',
		class: 'h-12',
		get value() {
			return profileModule.profile.lastName;
		},

		set value($$value) {
			profileModule.profile.lastName = $$value;
		}
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_2 = $.child(div_7);

	Input(node_2, {
		id: 'phone',
		name: 'phone',
		label: 'Phone Number',
		type: 'phone',
		placeholder: 'Enter phone number',
		class: 'h-12',
		get value() {
			return profileModule.profile.phone;
		},

		set value($$value) {
			profileModule.profile.phone = $$value;
		}
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_3 = $.child(div_8);

	Input(node_3, {
		id: 'email',
		type: 'email',
		name: 'email',
		label: 'Email Address',
		placeholder: 'Enter Email',
		required: true,
		class: 'h-12',
		get value() {
			return profileModule.profile.email;
		},

		set value($$value) {
			profileModule.profile.email = $$value;
		}
	});

	$.reset(div_8);
	$.reset(div_4);
	$.reset(form);
	$.reset(div_3);
	$.reset(div_2);

	var div_9 = $.sibling(div_2, 2);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var div_12 = $.child(div_11);
	var node_4 = $.child(div_12);

	AlertCircle(node_4, { class: 'h-5 w-5' });
	$.reset(div_12);
	$.next(2);
	$.reset(div_11);
	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var div_14 = $.child(div_13);
	var node_5 = $.sibling($.child(div_14), 2);

	Button(node_5, {
		variant: 'destructive',
		class: 'h-12 px-6',
		onclick: () => goto('/my/profile/delete'),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Request Deletion');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_14);
	$.reset(div_13);
	$.reset(div_9);
	$.reset(div_1);
	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_15 = root_2();
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var div_18 = $.child(div_17);
			var node_7 = $.child(div_18);

			InfoIcon(node_7, { class: 'h-4 w-4' });
			$.reset(div_18);
			$.next(2);
			$.reset(div_17);

			var node_8 = $.sibling(div_17, 2);

			Button(node_8, {
				get onclick() {
					return profileModule.saveProfile;
				},
				class: 'h-10 px-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_9 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = root();
							var node_10 = $.first_child(fragment_2);

							Loader(node_10, { class: 'mr-2 h-4 w-4 animate-spin' });
							$.next();
							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var fragment_3 = root_1();
							var node_11 = $.first_child(fragment_3);

							Save(node_11, { class: 'mr-2 h-4 w-4' });
							$.next();
							$.append($$anchor, fragment_3);
						};

						$.if(node_9, ($$render) => {
							if (profileModule.isLoading) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_16);
			$.reset(div_15);
			$.transition(1, div_15, () => fly, () => ({ y: 50, duration: 400 }));
			$.transition(2, div_15, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_15);
		};

		$.if(node_6, ($$render) => {
			if (profileModule.detailsChanged) $$render(consequent_1);
		});
	}

	$.event('submit', form, function (...$$args) {
		profileModule.saveProfile?.apply(this, $$args);
	});

	$.delegated('input', form, function (...$$args) {
		profileModule.handleDetailsChange?.apply(this, $$args);
	});

	$.transition(1, div_1, () => fly, () => ({ y: 20, duration: 600 }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input']);