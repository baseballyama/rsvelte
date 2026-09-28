import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { onMount } from "svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold m-6 mx-auto my-auto"> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let supabase = $.derived(() => $$props.data.supabase);
	let message = $.state("Signing out....");

	// on mount, sign out
	onMount(() => {
		$.get(supabase).auth.signOut().then(({ error }) => {
			if (error) {
				$.set(message, "There was an issue signing out.");
			} else {
				goto("/");
			}
		});
	});

	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, $.get(message)));
	$.append($$anchor, h1);
	$.pop();
}