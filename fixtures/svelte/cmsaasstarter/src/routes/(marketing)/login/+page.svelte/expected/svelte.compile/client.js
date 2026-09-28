import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><h1 class="text-xl font-bold">Get Started</h1> <a href="/login/sign_up"><button class="btn btn-primary mt-3 btn-wide">Sign Up</button></a> <h1 class="text-xl mt-6">Already have an account?</h1> <a href="/login/sign_in"><button class="btn btn-outline btn-primary mt-3 btn-wide">Sign In</button></a></div>`);

export default function _page($$anchor) {
	var div = root();

	$.head('17q9lpe', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Log In';
		});
	});

	$.append($$anchor, div);
}