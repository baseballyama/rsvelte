import * as $ from 'svelte/internal/server';
import Github from '$assets/github.svg';
import { enhance } from '$app/forms';
import { loading } from '$state/loading';
import { form_action } from '$lib/form_action';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { user } = data;

		$$renderer.push(`<section class="content svelte-1pltak1"><div class="card svelte-1pltak1"><h1 class="h3">Login</h1> `);

		if (user) {
			$$renderer.push(`<!--[0--><p>Hell yea, You are currently Logged In</p> <form action="/?/logout" method="POST"><button class="button" type="submit">Logout</button></form>`);
		} else {
			$$renderer.push(`<!--[-1--><p>If you are not on the Syntax team, this login will do nothing for you.</p> <a class="button subtle" href="/api/oauth/github" rel="external"><img width="20"${$.attr('src', Github)} alt="Github Logo"/> Login With Github</a>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}