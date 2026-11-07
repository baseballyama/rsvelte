import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { onMount } from "svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let supabase = $.derived(() => data.supabase);
		let message = "Signing out....";

		// on mount, sign out
		onMount(() => {
			supabase().auth.signOut().then(({ error }) => {
				if (error) {
					message = "There was an issue signing out.";
				} else {
					goto("/");
				}
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold m-6 mx-auto my-auto">${$.escape(message)}</h1>`);
	});
}