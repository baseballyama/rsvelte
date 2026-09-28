import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '../Icon.svelte';
import { check_for_cached_mp3 } from '$state/player_offline';

var root = $.from_html(`<button title="Save for offline" class="svelte-73pu1d"><div><!></div></button>`);

export default function SaveOffline($$anchor, $$props) {
	$.push($$props, true);

	let save_status = $.state('INITIAL');

	check_for_cached_mp3($$props.show.url).then((response) => {
		if (response) {
			$.set(save_status, 'SAVED');
		} else {
			$.set(save_status, 'UNSAVED');
		}
	});

	function save_show_for_offline() {
		$.set(save_status, 'SAVING');

		const mp3Url = $$props.show.url;

		// Fetch the MP3 file
		fetch(mp3Url).then((response) => response.blob()).then((blob) => {
			// Make a show without the show notes for the cache
			let pruned_show = {
				id: $$props.show.id,
				title: $$props.show.title,
				number: $$props.show.number,
				date: $$props.show.date,
				url: $$props.show.url,
				show: $$props.show.slug
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
				$.set(save_status, 'SAVED');
				console.log('MP3 file saved for offline listening.');
			}).catch((error) => {
				console.error('Failed to save MP3 file:', error);
			});
		}).catch((error) => {
			console.error('Failed to fetch MP3 file:', error);
		});
	}

	var button = root();
	var div = $.child(button);
	var node = $.child(div);

	Icon(node, { name: 'thumbtack' });
	$.reset(div);
	$.reset(button);
	$.template_effect(() => $.set_class(div, 1, $.clsx($.get(save_status)), 'svelte-73pu1d'));
	$.delegated('click', button, save_show_for_offline);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);