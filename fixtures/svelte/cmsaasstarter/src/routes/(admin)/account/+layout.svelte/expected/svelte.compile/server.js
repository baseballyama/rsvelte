import * as $ from 'svelte/internal/server';
import { invalidate } from "$app/navigation";
import { onMount } from "svelte";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		let supabase = $.derived(() => data.supabase);
		let session = $.derived(() => data.session);

		onMount(() => {
			const { data } = supabase().auth.onAuthStateChange((event, _session) => {
				if (_session?.expires_at !== session()?.expires_at) {
					invalidate("supabase:auth");
				}
			});

			return () => data.subscription.unsubscribe();
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}