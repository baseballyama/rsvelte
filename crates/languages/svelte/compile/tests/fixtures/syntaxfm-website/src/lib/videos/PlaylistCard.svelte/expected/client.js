import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlaylistVideo from './PlaylistVideo.svelte';

var root = $.from_html(`<article class="card svelte-1odf0i4"><p class="date svelte-1odf0i4"> </p> <h3 class="svelte-1odf0i4"><a class="svelte-1odf0i4"> </a></h3> <div class="grid playlist-grid svelte-1odf0i4"></div> <a class="button see-all svelte-1odf0i4">See All Videos</a></article>`);

export default function PlaylistCard($$anchor, $$props) {
	$.push($$props, true);

	var article = root();
	var p = $.child(article);
	var text = $.only_child(p);
	var h3 = $.sibling(p, 2);
	var a = $.child(h3);
	var text_1 = $.only_child(a, true);

	$.reset(h3);

	var div = $.sibling(h3, 2);

	$.each(div, 21, () => $$props.playlist.videos, $.index, ($$anchor, playlist_video) => {
		PlaylistVideo($$anchor, {
			get video() {
				return $.get(playlist_video).video;
			},

			get playlist() {
				return $$props.playlist;
			}
		});
	});

	$.reset(div);

	var a_1 = $.sibling(div, 2);

	$.reset(article);

	$.template_effect(() => {
		$.set_text(text, `${$$props.playlist.item_count ?? ''} Videos`);
		$.set_attribute(a, 'href', `/videos/${$$props.playlist.slug}`);
		$.set_text(text_1, $$props.playlist.title);
		$.set_attribute(a_1, 'href', `/videos/${$$props.playlist.slug ?? ''}`);
	});

	$.append($$anchor, article);
	$.pop();
}