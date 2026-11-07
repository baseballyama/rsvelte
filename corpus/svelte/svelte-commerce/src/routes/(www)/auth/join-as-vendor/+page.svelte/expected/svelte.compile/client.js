import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { JoinAsVendorModule } from '$lib/core/composables/index.js';
import { LoaderCircle } from '@lucide/svelte';

var root = $.from_html(`<div class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"><div class="w-full max-w-md space-y-8"><div class="space-y-6 rounded-lg bg-white p-8 shadow dark:bg-gray-800"><div class="space-y-2 text-center"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create your vendor account</h2> <p class="text-gray-500 dark:text-gray-400"> </p></div> <form class="space-y-4"><!> <!> <!> <!> <!> <!> <!> <!></form> <div class="text-center text-sm text-gray-600"> <!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const joinAsVendorModule = new JoinAsVendorModule();
	const schemas = joinAsVendorModule.schemas;
	var div = root();

	$.head('ef0pwx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Signup';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var p = $.sibling($.child(div_3), 2);
	var text = $.only_child(p);

	$.reset(div_3);

	var form = $.sibling(div_3, 2);
	var node = $.child(form);

	Textbox(node, {
		name: 'firstName',
		placeholder: 'John',
		get schema() {
			return schemas.firstName;
		},
		label: 'First Name',
		required: true,
		get value() {
			return joinAsVendorModule.firstName;
		},

		set value($$value) {
			joinAsVendorModule.firstName = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Textbox(node_1, {
		name: 'lastName',
		placeholder: 'Doe',
		get schema() {
			return schemas.lastName;
		},
		label: 'Last Name',
		required: true,
		get value() {
			return joinAsVendorModule.lastName;
		},

		set value($$value) {
			joinAsVendorModule.lastName = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Textbox(node_2, {
		name: 'email',
		type: 'email',
		placeholder: 'm@example.com',
		get schema() {
			return schemas.email;
		},
		label: 'Email',
		required: true,
		get value() {
			return joinAsVendorModule.email;
		},

		set value($$value) {
			joinAsVendorModule.email = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Textbox(node_3, {
		name: 'phone',
		type: 'tel',
		placeholder: '+1234567890',
		get schema() {
			return schemas.phone;
		},
		label: 'Phone',
		required: true,
		get value() {
			return joinAsVendorModule.phone;
		},

		set value($$value) {
			joinAsVendorModule.phone = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Textbox(node_4, {
		name: 'businessName',
		placeholder: 'e.g., Varni Jewels',
		get schema() {
			return schemas.businessName;
		},
		label: 'Business Name',
		required: true,
		get value() {
			return joinAsVendorModule.businessName;
		},

		set value($$value) {
			joinAsVendorModule.businessName = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Textbox(node_5, {
		name: 'password',
		type: 'password',
		placeholder: '••••••••',
		get schema() {
			return schemas.password;
		},
		label: 'Password',
		required: true,
		get value() {
			return joinAsVendorModule.password;
		},

		set value($$value) {
			joinAsVendorModule.password = $$value;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Textbox(node_6, {
		name: 'confirmPassword',
		type: 'password',
		placeholder: '••••••••',
		get schema() {
			return schemas.confirmPassword;
		},
		label: 'Confirm Password',
		required: true,
		get value() {
			return joinAsVendorModule.confirmPassword;
		},

		set value($$value) {
			joinAsVendorModule.confirmPassword = $$value;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		type: 'submit',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_8 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					LoaderCircle($$anchor, { class: 'animate-spin' });
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('Create Account');

					$.append($$anchor, text_1);
				};

				$.if(node_8, ($$render) => {
					if (joinAsVendorModule.isLoading) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_4 = $.sibling(form, 2);
	var text_2 = $.child(div_4);

	text_2.nodeValue = 'Already have an account?  ';

	var node_9 = $.sibling(text_2);

	AuthButton(node_9, {
		type: 'login',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'link',
				class: 'text-primary-600 hover:text-primary-500 h-auto p-0',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign in');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `Start selling on ${page?.data?.store?.name ?? ''} today`));

	$.event('submit', form, function (...$$args) {
		joinAsVendorModule.handleSubmit?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}