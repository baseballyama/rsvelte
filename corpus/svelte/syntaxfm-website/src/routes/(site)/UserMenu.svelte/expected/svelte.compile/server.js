import * as $ from 'svelte/internal/server';
import Github from '$assets/github.svg';
import DropdownMenu from '$lib/DropdownMenu.svelte';
import { enhance } from '$app/forms';
import { loading } from '$state/loading';
import { form_action } from '$lib/form_action';

export default function UserMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user } = $$props;

		if (user) {
			$$renderer.push('<!--[0-->');

			{
				function button($$renderer) {
					$$renderer.push(`<img class="avatar svelte-gq0jcd"${$.attr('src', user.avatar_url)} alt="User Avatar"/>`);
				}

				DropdownMenu($$renderer, {
					popover_id: 'user-menu',
					button,
					children: ($$renderer) => {
						$$renderer.push(`<div><form action="/?/logout" method="POST"><button type="submit">Logout</button></form></div>`);
					},
					$$slots: { button: true, default: true }
				});
			}
		} else {
			$$renderer.push(`<!--[-1--><a href="/api/oauth/github" rel="external"><img width="20"${$.attr('src', Github)} alt="Github Logo"/> Login With Github</a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}