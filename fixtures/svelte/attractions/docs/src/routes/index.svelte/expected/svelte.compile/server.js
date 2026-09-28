import * as $ from 'svelte/internal/server';
import { Card, Button, H1 } from 'attractions';
import { BookOpenIcon, GithubIcon } from 'svelte-feather-icons';
import InfoTiles from 'src/containers/home/info-tiles.svelte';

export default function Routes($$renderer) {
	$.head('1iahb9e', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Attractions</title>`);
		});

		$$renderer.push(`<meta name="og:title" content="Attractions"/>`);
	});

	$$renderer.push(`<main>`);

	Card($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<header><img src="logo-no-bg.svg" alt="Attractions logo"/> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Attractions`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="./docs/changelog" class="hide-on-tb-more" sapper:prefetch="">v${$.escape(process.latest_version)}</a></header> <p>A <mark>pretty cool</mark> UI kit for <a href="https://svelte.dev">Svelte</a>.</p> <div class="actions">`);

			Button($$renderer, {
				filled: true,
				href: './docs',
				children: ($$renderer) => {
					BookOpenIcon($$renderer, { size: '24', class: 'mr' });
					$$renderer.push(`<!----> docs`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				class: 'ml',
				href: 'https://github.com/illright/attractions',
				children: ($$renderer) => {
					GithubIcon($$renderer, { size: '24', class: 'mr' });
					$$renderer.push(`<!----> GitHub`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="strip"></div> `);
	InfoTiles($$renderer, {});

	$$renderer.push(`<!----> <footer><p>made with ❤ by <a href="https://github.com/aabounegm">@aabounegm</a> and <a href="https://github.com/illright">@illright</a></p> <p>${$.escape(process.license)}
      licensed  •  <a href="./docs/changelog" sapper:prefetch="">v${$.escape(process.latest_version)}</a></p></footer></main>`);
}