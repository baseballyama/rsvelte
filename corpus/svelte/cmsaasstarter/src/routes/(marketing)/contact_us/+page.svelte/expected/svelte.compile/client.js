import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance, applyAction } from "$app/forms";

var root = $.from_html(`<div class="flex flex-col place-content-center lg:min-h-[70vh]"><div class="card card-bordered shadow-lg py-6 px-6 mx-2 lg:mx-0 lg:p-6 mb-10"><div class="text-2xl font-bold mb-4">Thank you!</div> <p>We've received your message and will be in touch soon.</p></div></div>`);
var root_1 = $.from_html(`<div class="text-red-600 grow text-sm ml-2 text-right"> </div>`);
var root_2 = $.from_html(`<textarea></textarea>`);
var root_3 = $.from_html(`<input/>`);
var root_4 = $.from_html(`<label><div class="flex flex-row"><div class="text-base font-bold"> </div> <!></div> <!></label>`);
var root_5 = $.from_html(`<p class="text-red-600 text-sm mb-2">Please resolve above issues.</p>`);
var root_6 = $.from_html(`<div class="card card-bordered shadow-lg p-4 pt-6 mx-2 lg:mx-0 lg:p-6"><form class="form-widget flex flex-col" method="POST" action="?/submitContactUs"><!> <!> <button> </button></form></div>`);

var root_7 = $.from_html(`<div class="flex flex-col lg:flex-row mx-auto my-4 min-h-[70vh] place-items-center lg:place-items-start place-content-center"><div class="max-w-[400px] lg:max-w-[500px] flex flex-col place-content-center p-4 lg:mr-8 lg:mb-8 lg:min-h-[70vh]"><div class="px-6"><h1 class="text-2xl lg:text-4xl font-bold mb-4">Contact Us</h1> <p class="text-lg">Talk to one of our service professionals to:</p> <ul class="list-disc list-outside pl-6 py-4 space-y-1"><li>Get a live demo</li> <li>Discuss your specific needs</li> <li>Get a quote</li> <li>Answer any technical questions you have</li></ul> <p>Once you complete the form, we'll reach out to you! *</p> <p class="text-sm pt-8">*Not really for this demo page, but you should say something like that
        😉</p></div></div> <div class="flex flex-col grow m-4 lg:ml-10 min-w-[300px] stdphone:min-w-[360px] max-w-[400px] place-content-center lg:min-h-[70vh]"><!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let errors = $.state($.proxy({}));
	let loading = $.state(false);
	let showSuccess = $.state(false);

	const formFields = [
		{
			id: "first_name",
			label: "First Name *",
			inputType: "text",
			autocomplete: "given-name"
		},

		{
			id: "last_name",
			label: "Last Name *",
			inputType: "text",
			autocomplete: "family-name"
		},

		{
			id: "email",
			label: "Email *",
			inputType: "email",
			autocomplete: "email"
		},

		{
			id: "phone",
			label: "Phone Number",
			inputType: "tel",
			autocomplete: "tel"
		},

		{
			id: "company",
			label: "Company Name",
			inputType: "text",
			autocomplete: "organization"
		},

		{
			id: "message",
			label: "Message",
			inputType: "textarea",
			autocomplete: "off"
		}
	];

	const handleSubmit = () => {
		$.set(loading, true);
		$.set(errors, {}, true);

		return async ({ update, result }) => {
			await update({ reset: false });
			await applyAction(result);
			$.set(loading, false);

			if (result.type === "success") {
				$.set(showSuccess, true);
			} else if (result.type === "failure") {
				$.set(errors, result.data?.errors ?? {}, true);
			} else if (result.type === "error") {
				$.set(errors, { _: "An error occurred. Please check inputs and try again." }, true);
			}
		};
	};

	var div = root_7();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		};

		var alternate_1 = ($$anchor) => {
			var div_3 = root_6();
			var form = $.child(div_3);
			var node_1 = $.child(form);

			$.each(node_1, 17, () => formFields, $.index, ($$anchor, field) => {
				var label = root_4();
				var div_4 = $.child(label);
				var div_5 = $.child(div_4);
				var text = $.only_child(div_5, true);
				var node_2 = $.sibling(div_5, 2);

				{
					var consequent_1 = ($$anchor) => {
						var div_6 = root_1();
						var text_1 = $.only_child(div_6, true);

						$.template_effect(() => $.set_text(text_1, $.get(errors)[$.get(field).id]));
						$.append($$anchor, div_6);
					};

					$.if(node_2, ($$render) => {
						if ($.get(errors)[$.get(field).id]) $$render(consequent_1);
					});
				}

				$.reset(div_4);

				var node_3 = $.sibling(div_4, 2);

				{
					var consequent_2 = ($$anchor) => {
						var textarea = root_2();

						$.set_attribute(textarea, 'rows', 4);

						$.template_effect(() => {
							$.set_attribute(textarea, 'id', $.get(field).id);
							$.set_attribute(textarea, 'name', $.get(field).id);
							$.set_attribute(textarea, 'autocomplete', $.get(field).autocomplete);
							$.set_class(textarea, 1, `${$.get(errors)[$.get(field).id] ? 'input-error' : ''} h-24 input-sm mt-1 input input-bordered w-full mb-3 text-base py-4`);
						});

						$.append($$anchor, textarea);
					};

					var alternate = ($$anchor) => {
						var input = root_3();

						$.template_effect(() => {
							$.set_attribute(input, 'id', $.get(field).id);
							$.set_attribute(input, 'name', $.get(field).id);
							$.set_attribute(input, 'type', $.get(field).inputType);
							$.set_attribute(input, 'autocomplete', $.get(field).autocomplete);
							$.set_class(input, 1, `${$.get(errors)[$.get(field).id] ? 'input-error' : ''} input-sm mt-1 input input-bordered w-full mb-3 text-base py-4`);
						});

						$.append($$anchor, input);
					};

					$.if(node_3, ($$render) => {
						if ($.get(field).inputType === "textarea") $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				$.reset(label);

				$.template_effect(() => {
					$.set_attribute(label, 'for', $.get(field).id);
					$.set_text(text, $.get(field).label);
				});

				$.append($$anchor, label);
			});

			var node_4 = $.sibling(node_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p = root_5();

					$.append($$anchor, p);
				};

				var d = $.derived(() => Object.keys($.get(errors)).length > 0);

				$.if(node_4, ($$render) => {
					if ($.get(d)) $$render(consequent_3);
				});
			}

			var button = $.sibling(node_4, 2);
			var text_2 = $.only_child(button, true);

			$.reset(form);
			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => handleSubmit);
			$.reset(div_3);

			$.template_effect(() => {
				$.set_class(button, 1, `btn btn-primary ${$.get(loading) ? 'btn-disabled' : ''}`);
				$.set_text(text_2, $.get(loading) ? "Submitting" : "Submit");
			});

			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(showSuccess)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}