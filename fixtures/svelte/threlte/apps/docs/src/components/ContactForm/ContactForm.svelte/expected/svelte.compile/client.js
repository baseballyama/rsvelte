import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Form from './Form.svelte';
import { Fieldset, TextField, TextAreaField, EmailField } from './fields';

var root = $.from_html(`<span class="svelte-10rausk">You already sent us a message, but feel free to contact us again.</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="absolute top-0 left-0 flex h-full w-full flex-col items-center gap-2 bg-[#0A0F19] pt-12 text-2xl svelte-10rausk"><span class="loader svelte-10rausk"></span> <span class="svelte-10rausk">Please wait...</span></div>`);
var root_3 = $.from_html(`<div class="absolute top-0 left-0 flex h-full w-full flex-col items-center gap-2 bg-[#0A0F19] pt-10 text-2xl svelte-10rausk"><span class="svelte-10rausk">Message sent.</span> <span class="svelte-10rausk">Thank you for getting in touch!</span></div>`);
var root_4 = $.from_html(`<div class="relative svelte-10rausk"><!> <!> <!> <!></div>`);

export default function ContactForm($$anchor) {
	let formData = { name: '', email: '', message: '' };
	let sending = false;
	let sent = false;
	let sentPreviously = false;

	const handleSubmit = async (e) => {
		sending = true;
		e.preventDefault();

		try {
			await fetch('https://discord.com/api/webhooks/1215041655053230201/L6np-p6XLBbkWJsmNxH56IVfDRN044yLq47bMTsy_tVPSvoRVIhQqnS-I4_Pl4_KTF2y', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({
					username: 'Contact form',
					embeds: [
						{
							author: { name: formData.name },
							description: formData.message,
							footer: { text: `email: ${formData.email}` }
						}
					]
				})
			});

			sending = false;
			sent = true;

			setTimeout(
				() => {
					sent = false;
					sentPreviously = true;
					formData = { name: '', email: '', message: '' };
				},
				4000
			);
		} catch(e) {
			alert('Failed to send the message. Check network connection and try again.');
			sent = false;
		}
	};

	var div = root_4();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (sentPreviously) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Form(node_1, {
		action: 'contact',
		submitButton: 'Send',
		onsubmit: handleSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Fieldset(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_3 = $.first_child(fragment_1);

					TextField(node_3, {
						label: 'Name',
						required: true,
						get value() {
							return formData.name;
						},

						set value($$value) {
							formData.name = $$value;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					EmailField(node_4, {
						required: true,
						get value() {
							return formData.email;
						},

						set value($$value) {
							formData.email = $$value;
						}
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			Fieldset(node_5, {
				children: ($$anchor, $$slotProps) => {
					TextAreaField($$anchor, {
						label: 'Message',
						required: true,
						get value() {
							return formData.message;
						},

						set value($$value) {
							formData.message = $$value;
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_2();

			$.append($$anchor, div_1);
		};

		$.if(node_6, ($$render) => {
			if (sending) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_3();

			$.append($$anchor, div_2);
		};

		$.if(node_7, ($$render) => {
			if (sent) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}