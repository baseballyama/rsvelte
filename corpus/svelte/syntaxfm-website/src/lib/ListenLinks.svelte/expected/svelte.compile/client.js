import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from './Icon.svelte';

var root = $.from_html(`<a class="icon svelte-e9n9in" target="_blank" title="Watch on Youtube" aria-label="Youtube"><!></a>`);
var root_1 = $.from_html(`<a class="icon svelte-e9n9in" target="_blank" title="Watch or Listen on Spotify" aria-label="Spotify"><!></a> <!> <a class="icon svelte-e9n9in" title="Listen on Apple Podcasts" aria-label="Apple Podcasts" target="_blank" href="https://podcasts.apple.com/ca/podcast/syntax-tasty-web-development-treats/id1253186678"><!></a>`, 1);

export default function ListenLinks($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var a = $.first_child(fragment);
	var node = $.child(a);

	Icon(node, { name: 'spotify' });
	$.reset(a);

	var node_1 = $.sibling(a, 2);

	{
		var consequent = ($$anchor) => {
			var a_1 = root();

			$.set_style(a_1, '', {}, { '--fg': '#F61C0D' });

			var node_2 = $.child(a_1);

			Icon(node_2, { name: 'youtube' });
			$.reset(a_1);
			$.template_effect(() => $.set_attribute(a_1, 'href', $$props.show.youtube_url));
			$.append($$anchor, a_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.show.youtube_url) $$render(consequent);
		});
	}

	var a_2 = $.sibling(node_1, 2);
	var node_3 = $.child(a_2);

	Icon(node_3, { name: 'apple-podcasts' });
	$.reset(a_2);

	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [
		() => $$props.show.spotify_id
			? `https://open.spotify.com/episode/${$$props.show.spotify_id}`
			: `https://open.spotify.com/search/syntax.fm ${encodeURI($$props.show.title)}/episodes`
	]);

	$.append($$anchor, fragment);
	$.pop();
}