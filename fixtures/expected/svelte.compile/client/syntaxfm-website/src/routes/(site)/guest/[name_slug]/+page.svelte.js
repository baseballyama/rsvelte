import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ShowCard from '$lib/ShowCard.svelte';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';

var root = $.from_html(`<div class="guest_socials svelte-1az1ati"><!></div>`);
var root_1 = $.from_html(`<section><header class="svelte-1az1ati"><img class="svelte-1az1ati"/> <div><h1 class="svelte-1az1ati"> </h1> <!></div></header> <!></section>`);

export default function _page($$anchor, $$props) {
	let guest = $.derived(() => $$props.data.guest);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var section = root_1();
			var header = $.child(section);
			var img = $.child(header);
			var div = $.sibling(img, 2);
			var h1 = $.child(div);
			var text = $.only_child(h1, true);
			var node_1 = $.sibling(h1, 2);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();
					var node_2 = $.child(div_1);

					HostSocialLink(node_2, {
						get host() {
							return $.get(guest);
						}
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(guest).twitter || $.get(guest).github || $.get(guest).url) $$render(consequent);
				});
			}

			$.reset(div);
			$.reset(header);

			var node_3 = $.sibling(header, 2);

			$.each(node_3, 17, () => $.get(guest).shows, $.index, ($$anchor, $$item) => {
				let Show = () => $.get($$item).Show;

				ShowCard($$anchor, {
					get show() {
						return Show();
					},
					display: 'list'
				});
			});

			$.reset(section);

			$.template_effect(() => {
				$.set_attribute(img, 'src', `https://github.com/${$.get(guest).github}.png`);
				$.set_attribute(img, 'alt', $.get(guest).name);
				$.set_text(text, $.get(guest).name);
			});

			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(guest)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}