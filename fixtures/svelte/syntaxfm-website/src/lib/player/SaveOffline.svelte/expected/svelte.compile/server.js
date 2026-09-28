import * as $ from 'svelte/internal/server';
import Icon from '../Icon.svelte';
import { check_for_cached_mp3 } from '$state/player_offline';

export default function SaveOffline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show } = $$props;
		let save_status = 'INITIAL';

		check_for_cached_mp3(show.url).then((response) => {
			if (response) {
				save_status = 'SAVED';
			} else {
				save_status = 'UNSAVED';
			}
		});

		function save_show_for_offline() {
			save_status = 'SAVING';

			const mp3Url = show.url;

			// Fetch the MP3 file
			fetch(mp3Url).then((response) => response.blob()).then((blob) => {
				// Make a show without the show notes for the cache
				let pruned_show = {
					id: show.id,
					title: show.title,
					number: show.number,
					date: show.date,
					url: show.url,
					show: show.slug
				};

				// Create a new response with the MP3 blob
				const response = new Response(blob, {
					headers: {
						'Content-Type': 'audio/mpeg',
						'Content-Length': blob.size.toString(),
						Metadata: JSON.stringify(pruned_show)
					}
				});

				// Open the cache and store the MP3 response
				caches.open('mp3-cache').then((cache) => {
					cache.put(mp3Url, response);
					save_status = 'SAVED';
					console.log('MP3 file saved for offline listening.');
				}).catch((error) => {
					console.error('Failed to save MP3 file:', error);
				});
			}).catch((error) => {
				console.error('Failed to fetch MP3 file:', error);
			});
		}

		$$renderer.push(`<button title="Save for offline" class="svelte-73pu1d"><div${$.attr_class($.clsx(save_status), 'svelte-73pu1d')}>`);
		Icon($$renderer, { name: 'thumbtack' });
		$$renderer.push(`<!----></div></button>`);
	});
}