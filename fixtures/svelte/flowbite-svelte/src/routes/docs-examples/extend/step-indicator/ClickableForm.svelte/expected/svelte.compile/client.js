import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator, Button, Label, Input } from "flowbite-svelte";

var root = $.from_html(`<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3> <div><!> <!></div> <div><!> <!></div></div>`);
var root_1 = $.from_html(`<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h3> <div><!> <!></div> <div><!> <!></div></div>`);
var root_2 = $.from_html(`<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h3> <div><!> <!></div> <div class="grid grid-cols-2 gap-4"><div><!> <!></div> <div><!> <!></div></div></div>`);
var root_3 = $.from_html(`<div class="space-y-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Review Your Information</h3> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><dl class="space-y-2"><div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Name:</dt> <dd class="text-gray-900 dark:text-white"> </dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Email:</dt> <dd class="text-gray-900 dark:text-white"> </dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Phone:</dt> <dd class="text-gray-900 dark:text-white"> </dd></div> <div class="flex justify-between"><dt class="font-medium text-gray-500 dark:text-gray-400">Address:</dt> <dd class="text-gray-900 dark:text-white"> </dd></div></dl></div> <p class="text-sm text-gray-500 dark:text-gray-400">Click on any step indicator above to go back and edit your information.</p></div>`);
var root_4 = $.from_html(`<div class="space-y-4 text-center"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"><svg class="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div> <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Registration Complete!</h3> <p class="text-gray-500 dark:text-gray-400">Thank you for completing the form.</p></div>`);
var root_5 = $.from_html(`<div class="space-y-6"><!> <form class="space-y-4"><!> <div class="flex gap-2"><!> <!></div></form></div>`);

export default function ClickableForm($$anchor) {
	let currentStep = $.state(1);

	const steps = [
		"Personal Info",
		"Contact Details",
		"Address",
		"Review",
		"Complete"
	];

	// Form data
	let personalInfo = $.proxy({ firstName: "", lastName: "" });

	let contactInfo = $.proxy({ email: "", phone: "" });
	let addressInfo = $.proxy({ street: "", city: "", zip: "" });

	function next() {
		if ($.get(currentStep) < steps.length) {
			$.update(currentStep);
		}
	}

	function prev() {
		if ($.get(currentStep) > 1) {
			$.update(currentStep, -1);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		next();
	}

	var div = root_5();
	var node = $.child(div);

	StepIndicator(node, {
		get steps() {
			return steps;
		},
		color: 'primary',
		glow: true,
		get currentStep() {
			return $.get(currentStep);
		},

		set currentStep($$value) {
			$.set(currentStep, $$value, true);
		}
	});

	var form = $.sibling(node, 2);
	var node_1 = $.child(form);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var div_2 = $.sibling($.child(div_1), 2);
			var node_2 = $.child(div_2);

			Label(node_2, {
				for: 'firstName',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First Name');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				type: 'text',
				id: 'firstName',
				placeholder: 'John',
				required: true,
				get value() {
					return personalInfo.firstName;
				},

				set value($$value) {
					personalInfo.firstName = $$value;
				}
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_4 = $.child(div_3);

			Label(node_4, {
				for: 'lastName',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Last Name');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Input(node_5, {
				type: 'text',
				id: 'lastName',
				placeholder: 'Doe',
				required: true,
				get value() {
					return personalInfo.lastName;
				},

				set value($$value) {
					personalInfo.lastName = $$value;
				}
			});

			$.reset(div_3);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var div_5 = $.sibling($.child(div_4), 2);
			var node_6 = $.child(div_5);

			Label(node_6, {
				for: 'email',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Email');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Input(node_7, {
				type: 'email',
				id: 'email',
				placeholder: 'john.doe@example.com',
				required: true,
				get value() {
					return contactInfo.email;
				},

				set value($$value) {
					contactInfo.email = $$value;
				}
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_8 = $.child(div_6);

			Label(node_8, {
				for: 'phone',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Phone');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Input(node_9, {
				type: 'tel',
				id: 'phone',
				placeholder: '+1 (555) 123-4567',
				required: true,
				get value() {
					return contactInfo.phone;
				},

				set value($$value) {
					contactInfo.phone = $$value;
				}
			});

			$.reset(div_6);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		var consequent_2 = ($$anchor) => {
			var div_7 = root_2();
			var div_8 = $.sibling($.child(div_7), 2);
			var node_10 = $.child(div_8);

			Label(node_10, {
				for: 'street',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Street Address');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Input(node_11, {
				type: 'text',
				id: 'street',
				placeholder: '123 Main St',
				required: true,
				get value() {
					return addressInfo.street;
				},

				set value($$value) {
					addressInfo.street = $$value;
				}
			});

			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var div_10 = $.child(div_9);
			var node_12 = $.child(div_10);

			Label(node_12, {
				for: 'city',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('City');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Input(node_13, {
				type: 'text',
				id: 'city',
				placeholder: 'New York',
				required: true,
				get value() {
					return addressInfo.city;
				},

				set value($$value) {
					addressInfo.city = $$value;
				}
			});

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var node_14 = $.child(div_11);

			Label(node_14, {
				for: 'zip',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('ZIP Code');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Input(node_15, {
				type: 'text',
				id: 'zip',
				placeholder: '10001',
				required: true,
				get value() {
					return addressInfo.zip;
				},

				set value($$value) {
					addressInfo.zip = $$value;
				}
			});

			$.reset(div_11);
			$.reset(div_9);
			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		var consequent_3 = ($$anchor) => {
			var div_12 = root_3();
			var div_13 = $.sibling($.child(div_12), 2);
			var dl = $.child(div_13);
			var div_14 = $.child(dl);
			var dd = $.sibling($.child(div_14), 2);
			var text_7 = $.only_child(dd);

			$.reset(div_14);

			var div_15 = $.sibling(div_14, 2);
			var dd_1 = $.sibling($.child(div_15), 2);
			var text_8 = $.only_child(dd_1, true);

			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var dd_2 = $.sibling($.child(div_16), 2);
			var text_9 = $.only_child(dd_2, true);

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var dd_3 = $.sibling($.child(div_17), 2);
			var text_10 = $.only_child(dd_3);

			$.reset(div_17);
			$.reset(dl);
			$.reset(div_13);
			$.next(2);
			$.reset(div_12);

			$.template_effect(() => {
				$.set_text(text_7, `${personalInfo.firstName ?? ''} ${personalInfo.lastName ?? ''}`);
				$.set_text(text_8, contactInfo.email);
				$.set_text(text_9, contactInfo.phone);
				$.set_text(text_10, `${addressInfo.street ?? ''}, ${addressInfo.city ?? ''} ${addressInfo.zip ?? ''}`);
			});

			$.append($$anchor, div_12);
		};

		var consequent_4 = ($$anchor) => {
			var div_18 = root_4();

			$.append($$anchor, div_18);
		};

		$.if(node_1, ($$render) => {
			if ($.get(currentStep) === 1) $$render(consequent); else if ($.get(currentStep) === 2) $$render(consequent_1, 1); else if ($.get(currentStep) === 3) $$render(consequent_2, 2); else if ($.get(currentStep) === 4) $$render(consequent_3, 3); else if ($.get(currentStep) === 5) $$render(consequent_4, 4);
		});
	}

	var div_19 = $.sibling(node_1, 2);
	var node_16 = $.child(div_19);

	{
		var consequent_5 = ($$anchor) => {
			Button($$anchor, {
				type: 'button',
				onclick: prev,
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Previous');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_16, ($$render) => {
			if ($.get(currentStep) > 1 && $.get(currentStep) < 5) $$render(consequent_5);
		});
	}

	var node_17 = $.sibling(node_16, 2);

	{
		var consequent_6 = ($$anchor) => {
			Button($$anchor, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Next');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});
		};

		var consequent_7 = ($$anchor) => {
			Button($$anchor, {
				type: 'submit',
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Complete');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_17, ($$render) => {
			if ($.get(currentStep) < 4) $$render(consequent_6); else if ($.get(currentStep) === 4) $$render(consequent_7, 1);
		});
	}

	$.reset(div_19);
	$.reset(form);
	$.reset(div);
	$.event('submit', form, handleSubmit);
	$.append($$anchor, div);
}