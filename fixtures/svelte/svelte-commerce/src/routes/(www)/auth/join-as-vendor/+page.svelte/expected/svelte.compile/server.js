import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { JoinAsVendorModule } from '$lib/core/composables/index.js';
import { LoaderCircle } from '@lucide/svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const joinAsVendorModule = new JoinAsVendorModule();
		const schemas = joinAsVendorModule.schemas;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('ef0pwx', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Signup</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"><div class="w-full max-w-md space-y-8"><div class="space-y-6 rounded-lg bg-white p-8 shadow dark:bg-gray-800"><div class="space-y-2 text-center"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create your vendor account</h2> <p class="text-gray-500 dark:text-gray-400">Start selling on ${$.escape(page?.data?.store?.name)} today</p></div> <form class="space-y-4">`);

			Textbox($$renderer, {
				name: 'firstName',
				placeholder: 'John',
				schema: schemas.firstName,
				label: 'First Name',
				required: true,
				get value() {
					return joinAsVendorModule.firstName;
				},

				set value($$value) {
					joinAsVendorModule.firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'lastName',
				placeholder: 'Doe',
				schema: schemas.lastName,
				label: 'Last Name',
				required: true,
				get value() {
					return joinAsVendorModule.lastName;
				},

				set value($$value) {
					joinAsVendorModule.lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'email',
				type: 'email',
				placeholder: 'm@example.com',
				schema: schemas.email,
				label: 'Email',
				required: true,
				get value() {
					return joinAsVendorModule.email;
				},

				set value($$value) {
					joinAsVendorModule.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'phone',
				type: 'tel',
				placeholder: '+1234567890',
				schema: schemas.phone,
				label: 'Phone',
				required: true,
				get value() {
					return joinAsVendorModule.phone;
				},

				set value($$value) {
					joinAsVendorModule.phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'businessName',
				placeholder: 'e.g., Varni Jewels',
				schema: schemas.businessName,
				label: 'Business Name',
				required: true,
				get value() {
					return joinAsVendorModule.businessName;
				},

				set value($$value) {
					joinAsVendorModule.businessName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'password',
				type: 'password',
				placeholder: '••••••••',
				schema: schemas.password,
				label: 'Password',
				required: true,
				get value() {
					return joinAsVendorModule.password;
				},

				set value($$value) {
					joinAsVendorModule.password = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'confirmPassword',
				type: 'password',
				placeholder: '••••••••',
				schema: schemas.confirmPassword,
				label: 'Confirm Password',
				required: true,
				get value() {
					return joinAsVendorModule.confirmPassword;
				},

				set value($$value) {
					joinAsVendorModule.confirmPassword = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				class: 'w-full',
				children: ($$renderer) => {
					if (joinAsVendorModule.isLoading) {
						$$renderer.push('<!--[0-->');
						LoaderCircle($$renderer, { class: 'animate-spin' });
					} else {
						$$renderer.push(`<!--[-1-->Create Account`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form> <div class="text-center text-sm text-gray-600">Already have an account?  `);

			AuthButton($$renderer, {
				type: 'login',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'link',
						class: 'text-primary-600 hover:text-primary-500 h-auto p-0',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign in`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}