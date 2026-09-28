import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { fade } from 'svelte/transition';
import AuthForm from './AuthForm.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let email = $.store_get($$store_subs ??= {}, '$page', page).url.searchParams.get('email') || '';
		let stage = 'signin';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main class="primo-reset svelte-1s728sz"><div class="left svelte-1s728sz"><div class="box svelte-1s728sz">`);

			if (stage === 'signin') {
				$$renderer.push('<!--[0-->');

				function footer($$renderer) {
					$$renderer.push(`<button>Forgot your password?</button>`);
				}

				AuthForm($$renderer, {
					action: 'sign_in',
					title: 'Sign In',
					footer,
					get email() {
						return email;
					},

					set email($$value) {
						email = $$value;
						$$settled = false;
					}
				});
			} else if (stage === 'reset_password') {
				$$renderer.push('<!--[1-->');

				AuthForm($$renderer, {
					action: 'reset_password',
					title: 'Reset Password',
					get email() {
						return email;
					},

					set email($$value) {
						email = $$value;
						$$settled = false;
					}
				});
			} else if (stage === 'confirm_reset') {
				$$renderer.push('<!--[2-->');
				AuthForm($$renderer, { action: 'confirm_password_reset', title: 'Reset Password' });
			} else if (stage === 'create_password') {
				$$renderer.push('<!--[3-->');

				AuthForm($$renderer, {
					action: 'create_account',
					title: 'Create Account',
					get email() {
						return email;
					},

					set email($$value) {
						email = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}