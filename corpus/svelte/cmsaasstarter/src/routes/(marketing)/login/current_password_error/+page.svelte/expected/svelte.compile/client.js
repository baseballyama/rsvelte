import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1 class="text-2xl font-bold mb-6">Current Password Incorrect</h1> <p>You attempted edit your account with an incorrect current password, and have
  been logged out.</p> <p class="mt-6">If you remember your password <a href="/login/sign_in" class="link">sign in</a> and try again.</p> <p class="mt-6">If you forget your password <a href="/login/forgot_password" class="link">reset it</a>.</p>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();

	$.head('ft80p9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Current Password Incorrect';
		});
	});

	$.next(6);
	$.append($$anchor, fragment);
}