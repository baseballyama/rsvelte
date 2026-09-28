import * as $ from 'svelte/internal/server';
import { StepIndicator, Button, Label, Input } from "flowbite-svelte";

export default function ClickableForm($$renderer) {
	let currentStep = 1;

	const steps = [
		"Personal Info",
		"Contact Details",
		"Address",
		"Review",
		"Complete"
	];

	// Form data
	let personalInfo = { firstName: "", lastName: "" };

	let contactInfo = { email: "", phone: "" };
	let addressInfo = { street: "", city: "", zip: "" };

	function next() {
		if (currentStep < steps.length) {
			currentStep++;
		}
	}

	function prev() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		next();
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-6">`);

		StepIndicator($$renderer, {
			steps,
			color: 'primary',
			glow: true,
			get currentStep() {
				return currentStep;
			},

			set currentStep($$value) {
				currentStep = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <form class="space-y-4">`);

		if (currentStep === 1) {
			$$renderer.push(`<!--[0--><div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3> <div>`);

			Label($$renderer, {
				for: 'firstName',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->First Name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'firstName',
				placeholder: 'John',
				required: true,
				get value() {
					return personalInfo.firstName;
				},

				set value($$value) {
					personalInfo.firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'lastName',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Last Name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'lastName',
				placeholder: 'Doe',
				required: true,
				get value() {
					return personalInfo.lastName;
				},

				set value($$value) {
					personalInfo.lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
		} else if (currentStep === 2) {
			$$renderer.push(`<!--[1--><div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h3> <div>`);

			Label($$renderer, {
				for: 'email',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Email`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'email',
				id: 'email',
				placeholder: 'john.doe@example.com',
				required: true,
				get value() {
					return contactInfo.email;
				},

				set value($$value) {
					contactInfo.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'phone',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Phone`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'tel',
				id: 'phone',
				placeholder: '+1 (555) 123-4567',
				required: true,
				get value() {
					return contactInfo.phone;
				},

				set value($$value) {
					contactInfo.phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
		} else if (currentStep === 3) {
			$$renderer.push(`<!--[2--><div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h3> <div>`);

			Label($$renderer, {
				for: 'street',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Street Address`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'street',
				placeholder: '123 Main St',
				required: true,
				get value() {
					return addressInfo.street;
				},

				set value($$value) {
					addressInfo.street = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div>`);

			Label($$renderer, {
				for: 'city',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->City`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'city',
				placeholder: 'New York',
				required: true,
				get value() {
					return addressInfo.city;
				},

				set value($$value) {
					addressInfo.city = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Label($$renderer, {
				for: 'zip',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->ZIP Code`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'text',
				id: 'zip',
				placeholder: '10001',
				required: true,
				get value() {
					return addressInfo.zip;
				},

				set value($$value) {
					addressInfo.zip = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div></div>`);
		} else if (currentStep === 4) {
			$$renderer.push(`<!--[3--><div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Review Your Information</h3> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><dl class="space-y-2"><div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Name:</dt> <dd class="text-gray-900 dark:text-white">${$.escape(personalInfo.firstName)} ${$.escape(personalInfo.lastName)}</dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Email:</dt> <dd class="text-gray-900 dark:text-white">${$.escape(contactInfo.email)}</dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Phone:</dt> <dd class="text-gray-900 dark:text-white">${$.escape(contactInfo.phone)}</dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Address:</dt> <dd class="text-gray-900 dark:text-white">${$.escape(addressInfo.street)}, ${$.escape(addressInfo.city)} ${$.escape(addressInfo.zip)}</dd></div></dl></div> <p class="text-sm text-gray-500 dark:text-gray-400">Click on any step indicator above to go back and edit your information.</p></div>`);
		} else if (currentStep === 5) {
			$$renderer.push(`<!--[4--><div class="space-y-4 text-center"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"><svg class="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div> <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Registration Complete!</h3> <p class="text-gray-500 dark:text-gray-400">Thank you for completing the form.</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex gap-2">`);

		if (currentStep > 1 && currentStep < 5) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				type: 'button',
				onclick: prev,
				color: 'alternative',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Previous`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (currentStep < 4) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Next`);
				},
				$$slots: { default: true }
			});
		} else if (currentStep === 4) {
			$$renderer.push('<!--[1-->');

			Button($$renderer, {
				type: 'submit',
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Complete`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></form></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}