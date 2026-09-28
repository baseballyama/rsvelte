import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$.head('17q9lpe', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Log In</title>`);
		});
	});

	$$renderer.push(`<div><h1 class="text-xl font-bold">Get Started</h1> <a href="/login/sign_up"><button class="btn btn-primary mt-3 btn-wide">Sign Up</button></a> <h1 class="text-xl mt-6">Already have an account?</h1> <a href="/login/sign_in"><button class="btn btn-outline btn-primary mt-3 btn-wide">Sign In</button></a></div>`);
}