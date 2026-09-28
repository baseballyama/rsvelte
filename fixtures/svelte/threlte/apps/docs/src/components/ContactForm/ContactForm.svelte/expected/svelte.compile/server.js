import * as $ from 'svelte/internal/server';
import Form from './Form.svelte';
import { Fieldset, TextField, TextAreaField, EmailField } from './fields';

export default function ContactForm($$renderer) {
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="relative svelte-10rausk">`);

		if (sentPreviously) {
			$$renderer.push(`<!--[0--><span class="svelte-10rausk">You already sent us a message, but feel free to contact us again.</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Form($$renderer, {
			action: 'contact',
			submitButton: 'Send',
			onsubmit: handleSubmit,
			children: ($$renderer) => {
				Fieldset($$renderer, {
					children: ($$renderer) => {
						TextField($$renderer, {
							label: 'Name',
							required: true,
							get value() {
								return formData.name;
							},

							set value($$value) {
								formData.name = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						EmailField($$renderer, {
							required: true,
							get value() {
								return formData.email;
							},

							set value($$value) {
								formData.email = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Fieldset($$renderer, {
					children: ($$renderer) => {
						TextAreaField($$renderer, {
							label: 'Message',
							required: true,
							get value() {
								return formData.message;
							},

							set value($$value) {
								formData.message = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (sending) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 flex h-full w-full flex-col items-center gap-2 bg-[#0A0F19] pt-12 text-2xl svelte-10rausk"><span class="loader svelte-10rausk"></span> <span class="svelte-10rausk">Please wait...</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (sent) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 flex h-full w-full flex-col items-center gap-2 bg-[#0A0F19] pt-10 text-2xl svelte-10rausk"><span class="svelte-10rausk">Message sent.</span> <span class="svelte-10rausk">Thank you for getting in touch!</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}