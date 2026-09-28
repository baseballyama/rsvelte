import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$.head('ft80p9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Current Password Incorrect</title>`);
		});
	});

	$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Current Password Incorrect</h1> <p>You attempted edit your account with an incorrect current password, and have
  been logged out.</p> <p class="mt-6">If you remember your password <a href="/login/sign_in" class="link">sign in</a> and try again.</p> <p class="mt-6">If you forget your password <a href="/login/forgot_password" class="link">reset it</a>.</p>`);
}