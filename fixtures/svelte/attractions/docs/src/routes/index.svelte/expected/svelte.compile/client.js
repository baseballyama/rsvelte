import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button, H1 } from 'attractions';
import { BookOpenIcon, GithubIcon } from 'svelte-feather-icons';
import InfoTiles from 'src/containers/home/info-tiles.svelte';

var root = $.from_html(`<meta name="og:title" content="Attractions"/>`);
var root_1 = $.from_html(`<!> docs`, 1);
var root_2 = $.from_html(`<!> GitHub`, 1);
var root_3 = $.from_html(`<header><img src="logo-no-bg.svg" alt="Attractions logo"/> <!> <a href="./docs/changelog" class="hide-on-tb-more" sapper:prefetch=""></a></header> <p>A <mark>pretty cool</mark> UI kit for <a href="https://svelte.dev">Svelte</a>.</p> <div class="actions"><!> <!></div>`, 1);
var root_4 = $.from_html(`<main><!> <div class="strip"></div> <!> <footer><p>made with ❤ by <a href="https://github.com/aabounegm">@aabounegm</a> and <a href="https://github.com/illright">@illright</a></p> <p> <a href="./docs/changelog" sapper:prefetch=""></a></p></footer></main>`);

export default function Routes($$anchor) {
	var main = root_4();

	$.head('1iahb9e', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Attractions';
		});

		$.append($$anchor, meta);
	});

	var node = $.child(main);

	Card(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var header = $.first_child(fragment);
			var node_1 = $.sibling($.child(header), 2);

			H1(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Attractions');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_1, 2);

			a.textContent = `v${process.latest_version ?? ''}`;
			$.reset(header);

			var div = $.sibling(header, 4);
			var node_2 = $.child(div);

			Button(node_2, {
				filled: true,
				href: './docs',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_3 = $.first_child(fragment_1);

					BookOpenIcon(node_3, { size: '24', class: 'mr' });
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Button(node_4, {
				outline: true,
				class: 'ml',
				href: 'https://github.com/illright/attractions',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_5 = $.first_child(fragment_2);

					GithubIcon(node_5, { size: '24', class: 'mr' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 4);

	InfoTiles(node_6, {});

	var footer = $.sibling(node_6, 2);
	var p = $.sibling($.child(footer), 2);
	var text_1 = $.child(p);

	text_1.nodeValue = `${process.license ?? ''}
      licensed  •  `;

	var a_1 = $.sibling(text_1);

	a_1.textContent = `v${process.latest_version ?? ''}`;
	$.reset(p);
	$.reset(footer);
	$.reset(main);
	$.append($$anchor, main);
}