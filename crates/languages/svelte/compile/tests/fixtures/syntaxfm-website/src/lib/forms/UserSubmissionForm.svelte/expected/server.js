import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';
import { form_action } from '../form_action';
import { Turnstile } from 'svelte-turnstile';
import { env } from '$env/dynamic/public';
import InlineError from './InlineError.svelte';
import { UserSubmissionType } from '@prisma/client';

export default function UserSubmissionForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let reset = void 0;
		let { form, selected_submission_type = 'SPOOKY' } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (form?.error) {
				$$renderer.push(`<!--[0--><div class="error status svelte-1s1w3qe"><p class="svelte-1s1w3qe">Shoot! ${$.escape(form.message)}</p> <p class="text-sm svelte-1s1w3qe">Error: ${$.escape(form.error)}</p></div>`);
			} else if (form?.status === 200) {
				$$renderer.push(`<!--[1--><div class="success status svelte-1s1w3qe"><p class="svelte-1s1w3qe">Success!</p> <p class="text-sm svelte-1s1w3qe">${$.escape(form.message)}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form action="?" method="post" class="svelte-1s1w3qe"><div class="input-group svelte-1s1w3qe"><label for="submission_type">Submission Type</label> <div class="input svelte-1s1w3qe">`);
			InlineError($$renderer, { displayError: form?.fieldErrors?.['submission_type'] });
			$$renderer.push(`<!----> `);

			$$renderer.select(
				{
					name: 'submission_type',
					id: 'submission_type',
					value: selected_submission_type,
					class: ''
				},
				($$renderer) => {
					$$renderer.option({ value: 'POTLUCK' }, ($$renderer) => {
						$$renderer.push(`Potluck Question`);
					});

					$$renderer.option({ value: 'SPOOKY' }, ($$renderer) => {
						$$renderer.push(`👻🎃 Spooky Story Submission`);
					});

					$$renderer.option({ value: 'GUEST' }, ($$renderer) => {
						$$renderer.push(`Guest Suggestion`);
					});

					$$renderer.option({ value: 'FEEDBACK' }, ($$renderer) => {
						$$renderer.push(`Show Feedback`);
					});

					$$renderer.option({ value: 'OSS' }, ($$renderer) => {
						$$renderer.push(`💰 OSS Funding Suggestion`);
					});

					$$renderer.option({ value: 'OTHER' }, ($$renderer) => {
						$$renderer.push(`Other`);
					});
				},
				'svelte-1s1w3qe'
			);

			$$renderer.push(`</div></div> <div class="input-group svelte-1s1w3qe"><div><label for="body">What's Up?</label> <p class="required svelte-1s1w3qe">Required</p></div> <div class="input svelte-1s1w3qe">`);
			InlineError($$renderer, { displayError: form?.fieldErrors?.['body'] });
			$$renderer.push(`<!----> <textarea id="body" name="body" placeholder="What do you have to say? Write as much as you like!" required=""${$.attr('minlength', 25)}${$.attr('maxlength', 15000)} class="svelte-1s1w3qe"></textarea></div></div> <div class="input-group svelte-1s1w3qe"><label for="name">Name</label> <div class="input svelte-1s1w3qe">`);
			InlineError($$renderer, { displayError: form?.fieldErrors?.['name'] });
			$$renderer.push(`<!----> <input type="text" id="name" name="name" placeholder="Name, @handle, or Alias"${$.attr('maxlength', 100)} class="svelte-1s1w3qe"/></div></div> <div class="input-group svelte-1s1w3qe"><label for="email">Email</label> <div class="input svelte-1s1w3qe">`);
			InlineError($$renderer, { displayError: form?.fieldErrors?.['email'] });
			$$renderer.push(`<!----> <input type="email" id="email" name="email" placeholder="Only if we need it"${$.attr('maxlength', 100)} class="svelte-1s1w3qe"/></div></div> <div class="input-group turnstile svelte-1s1w3qe">`);

			Turnstile($$renderer, {
				appearance: 'interaction-only',
				siteKey: env.PUBLIC_TURNSTILE_SITE_KEY,
				get reset() {
					return reset;
				},

				set reset($$value) {
					reset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <button type="submit" class="svelte-1s1w3qe">Send</button></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}