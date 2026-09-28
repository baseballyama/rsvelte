import * as $ from 'svelte/internal/server';
import Icon from '$lib/Icon.svelte';
import { player } from '$state/player';
import toast, { Toaster } from 'svelte-french-toast';

export default function ShareActions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { timestamp = true, show } = $$props;
		let share_at_ts = false;

		const toHMS = (seconds) => {
			const hours = Math.floor(seconds / 3600);
			const minutes = Math.floor(seconds % 3600 / 60);
			const secs = seconds % 60;

			// Formatting to ensure two digits for minutes and seconds
			const formattedMinutes = minutes.toString().padStart(2, '0');

			const formattedSeconds = secs.toString().padStart(2, '0');

			return `${hours}:${formattedMinutes}:${formattedSeconds}`;
		};

		function copy(link) {
			navigator.clipboard.writeText(decodeURIComponent(link));
			toast.success(`Copied show link to clipboard`);
		}

		function copy_embed() {
			navigator.clipboard.writeText(`
<iframe
	scrolling="no"
	src="https://syntax.fm/embed/${show.number}"
	title="Show Embed"
	style="width: 100%; height: 230px; max-width: 1200px; border: 1px solid black"
/>
		`);

			toast.success(`Copied embed HTML to clipboard, if you post, let us know, we're happy to share.`);
		}

		let time_stamp = $.derived(() => share_at_ts && $.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime
			? `%3Ft%3D${toHMS(Math.trunc($.store_get($$store_subs ??= {}, '$player', player).audio?.currentTime))}`
			: ``);

		let share_url = $.derived(() => `https%3A//syntax.fm/${show.number}${time_stamp()}`);

		if (timestamp) {
			$$renderer.push(`<!--[0--><p><label><input${$.attr('checked', share_at_ts, true)} type="checkbox"/> Start at timestamp:</label> <input type="text"${$.attr('value', toHMS(Math.trunc($.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime || 0)))}/></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		Toaster($$renderer, {});
		$$renderer.push(`<!----> <button aria-label="Copy Embed Code for this show">`);
		Icon($$renderer, { name: 'code' });
		$$renderer.push(`<!----> Embed</button> <button aria-label="Copy link to this show">`);
		Icon($$renderer, { name: 'link' });
		$$renderer.push(`<!----> Link</button> <a class="button share--x svelte-1f3h7up" target="_blank"${$.attr('href', `https://twitter.com/intent/tweet?url=${share_url()}&text=${$.stringify(show.title)}&via=syntaxfm`)} aria-label="Share on Twitter">`);
		Icon($$renderer, { name: 'x' });
		$$renderer.push(`<!----></a> <a class="button share--facebook svelte-1f3h7up" target="_blank" aria-label="Share on Facebook"${$.attr('href', `https://facebook.com/sharer/sharer.php?u=${share_url()}&quote=${$.stringify(show.title)}`)}>`);
		Icon($$renderer, { name: 'facebook' });
		$$renderer.push(`<!----> Facebook</a> <a target="_blank" class="button share--linkedin svelte-1f3h7up" aria-label="Share on LinkedIn"${$.attr('href', `https://www.linkedin.com/sharing/share-offsite/?url=${share_url()}`)}>`);
		Icon($$renderer, { name: 'linkedin' });
		$$renderer.push(`<!----> LinkedIn</a>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}