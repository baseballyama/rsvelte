import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PUBLIC_URL } from '$env/static/public';
import Album from './Album.svelte';
import { player } from '$/state/player';

var root = $.from_html(`<a class="art-wrapper svelte-1l7jk1h"><!></a>`);
var root_1 = $.from_html(`<div class="cd svelte-1l7jk1h">📀</div>`);
var root_2 = $.from_html(`<div><!> <!></div>`);

export default function AlbumArt($$anchor, $$props) {
	$.push($$props, true);

	const $player = () => $.store_get(player, '$player', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let is_link = $.prop($$props, 'is_link', 3, false),
		show = $.prop($$props, 'show', 3, null);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var node_1 = $.child(a);

			Album(node_1, {});
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', `https://${PUBLIC_URL ?? ''}/${show().number ?? ''}`));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var div = root_2();
			let classes;
			var node_2 = $.child(div);

			Album(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_4 = $.first_child(fragment_1);

					$.key(node_4, () => $player()?.current_show?.id, ($$anchor) => {
						var div_1 = root_1();

						$.append($$anchor, div_1);
					});

					$.append($$anchor, fragment_1);
				};

				$.if(node_3, ($$render) => {
					if (!$player().initial_load) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.template_effect(() => classes = $.set_class(div, 1, 'art-wrapper svelte-1l7jk1h', null, classes, { loading: $player().status === 'LOADING' }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (is_link() && show()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}