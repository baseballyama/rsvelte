import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ShowCard from '$/lib/ShowCard.svelte';

var root = $.from_html(`<h2 class="h5">Related Shows</h2>`);
var root_1 = $.from_html(`<div class="video_page layout full svelte-fkg8c8"><div class="content"><youtube-video></youtube-video> <h1 class="h3"> </h1></div> <section class="layout full"><div class="main"></div> <aside class="sidebar"><!> <!></aside></section></div>`, 2);

export default function _page($$anchor, $$props) {
	let video = $.derived(() => $$props.data.video);

	function insertBreaks(str) {
		return str.replace(/(\d{2}:\d{2})/g, (match, p1, offset) => {
			return offset === 0 ? match : `<br />${match}`;
		});
	}

	function trimAfterHr(htmlString) {
		const parts = htmlString.split('<hr>');

		return parts[0].trim();
	}

	function prepare_description(html) {
		let description = trimAfterHr(html);

		return insertBreaks(description);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var youtube_video = $.child(div_1);

			$.set_custom_element_data(youtube_video, 'controls', true);
			$.template_effect(() => $.set_custom_element_data(youtube_video, 'src', `https://www.youtube.com/watch?v=${$.get(video).id ?? ''}`));
			$.set_class(youtube_video, 1, 'svelte-fkg8c8');

			var h1 = $.sibling(youtube_video, 2);
			var text = $.only_child(h1, true);

			$.reset(div_1);

			var section = $.sibling(div_1, 2);
			var div_2 = $.child(section);

			$.html(div_2, () => prepare_description($.get(video).description), true);
			$.reset(div_2);

			var aside = $.sibling(div_2, 2);
			var node_1 = $.child(aside);

			{
				var consequent = ($$anchor) => {
					var h2 = root();

					$.append($$anchor, h2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(video).shows.length > 0) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $.get(video).shows, $.index, ($$anchor, $$item) => {
				let show = () => $.get($$item).show;

				ShowCard($$anchor, {
					get show() {
						return show();
					}
				});
			});

			$.reset(aside);
			$.reset(section);
			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(video).title));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(video)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}