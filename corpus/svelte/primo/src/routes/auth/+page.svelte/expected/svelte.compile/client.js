import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { fade } from 'svelte/transition';
import AuthForm from './AuthForm.svelte';

var root = $.from_html(`<button>Forgot your password?</button>`);
var root_1 = $.from_html(`<main class="primo-reset svelte-1s728sz"><div class="left svelte-1s728sz"><div class="box svelte-1s728sz"><!></div></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let email = $.state($.proxy($page().url.searchParams.get('email') || ''));
	let stage = $.state('signin');

	$.user_pre_effect(() => {
		if ($page().url.searchParams.has('reset')) {
			$.set(stage, 'confirm_reset');
		}

		if ($page().url.searchParams.has('create')) {
			$.set(stage, 'create_password');
		}
	});

	var main = root_1();
	var div = $.child(main);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			const footer = ($$anchor) => {
				var button = root();

				$.delegated('click', button, () => $.set(stage, 'reset_password'));
				$.append($$anchor, button);
			};

			AuthForm($$anchor, {
				action: 'sign_in',
				title: 'Sign In',
				get footer() {
					return footer;
				},

				get email() {
					return $.get(email);
				},

				set email($$value) {
					$.set(email, $$value, true);
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			AuthForm($$anchor, {
				action: 'reset_password',
				title: 'Reset Password',
				get email() {
					return $.get(email);
				},

				set email($$value) {
					$.set(email, $$value, true);
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			AuthForm($$anchor, { action: 'confirm_password_reset', title: 'Reset Password' });
		};

		var consequent_3 = ($$anchor) => {
			AuthForm($$anchor, {
				action: 'create_account',
				title: 'Create Account',
				get email() {
					return $.get(email);
				},

				set email($$value) {
					$.set(email, $$value, true);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(stage) === 'signin') $$render(consequent); else if ($.get(stage) === 'reset_password') $$render(consequent_1, 1); else if ($.get(stage) === 'confirm_reset') $$render(consequent_2, 2); else if ($.get(stage) === 'create_password') $$render(consequent_3, 3);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.reset(main);
	$.transition(1, main, () => fade);
	$.append($$anchor, main);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);