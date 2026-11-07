import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from "$app/navigation";
import { onMount } from "svelte";

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let supabase = $.derived(() => $$props.data.supabase);
	let session = $.derived(() => $$props.data.session);

	onMount(() => {
		const { data } = $.get(supabase).auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== $.get(session)?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		return () => data.subscription.unsubscribe();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}