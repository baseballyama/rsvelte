import * as $ from 'svelte/internal/server';

import {
	mdiEmoticonSad,
	mdiBat,
	mdiBee,
	mdiBird,
	mdiBug,
	mdiButterfly,
	mdiCat,
	mdiCow,
	mdiDog,
	mdiDolphin,
	mdiDonkey,
	mdiDuck,
	mdiElephant,
	mdiFish,
	mdiHorse,
	mdiJellyfish,
	mdiKangaroo,
	mdiKoala,
	mdiOwl,
	mdiPanda,
	mdiPenguin,
	mdiPig,
	mdiRabbit,
	mdiRodent,
	mdiShark,
	mdiSheep,
	mdiSnail,
	mdiSnake,
	mdiSpider,
	mdiTortoise,
	mdiTurkey,
	mdiTurtle
} from '@mdi/js';

import Autocomplete from '@smui-extra/autocomplete';
import { Graphic, Text } from '@smui/list';

export default function _CustomDisplay($$renderer) {
	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = [
		{ text: 'Bat', icon: mdiBat },
		{ text: 'Bee', icon: mdiBee },
		{ text: 'Bird', icon: mdiBird },
		{ text: 'Bug', icon: mdiBug },
		{ text: 'Butterfly', icon: mdiButterfly },
		{ text: 'Cat', icon: mdiCat },
		{ text: 'Cow', icon: mdiCow },
		{ text: 'Dog', icon: mdiDog },
		{ text: 'Dolphin', icon: mdiDolphin },
		{ text: 'Donkey', icon: mdiDonkey },
		{ text: 'Duck', icon: mdiDuck },
		{ text: 'Elephant', icon: mdiElephant },
		{ text: 'Fish', icon: mdiFish },
		{ text: 'Horse', icon: mdiHorse },
		{ text: 'Jellyfish', icon: mdiJellyfish },
		{ text: 'Kangaroo', icon: mdiKangaroo },
		{ text: 'Koala', icon: mdiKoala },
		{ text: 'Owl', icon: mdiOwl },
		{ text: 'Panda', icon: mdiPanda },
		{ text: 'Penguin', icon: mdiPenguin },
		{ text: 'Pig', icon: mdiPig },
		{ text: 'Rabbit', icon: mdiRabbit },
		{ text: 'Rodent', icon: mdiRodent },
		{ text: 'Shark', icon: mdiShark },
		{ text: 'Sheep', icon: mdiSheep },
		{ text: 'Snail', icon: mdiSnail },
		{ text: 'Snake', icon: mdiSnake },
		{ text: 'Spider', icon: mdiSpider },
		{ text: 'Tortoise', icon: mdiTortoise },
		{ text: 'Turkey', icon: mdiTurkey },
		{ text: 'Turtle', icon: mdiTurtle }
	];

	let value = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function loading($$renderer) {
				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});
			}

			function error($$renderer) {
				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Error while fetching suggestions.`);
					},
					$$slots: { default: true }
				});
			}

			function match($$renderer, item) {
				Graphic($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<svg viewBox="0 0 24 24"><path fill="currentColor"${$.attr('d', item.icon)}></path></svg>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.text)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			function noMatches($$renderer) {
				Graphic($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<svg viewBox="0 0 24 24"><path fill="currentColor"${$.attr('d', mdiEmoticonSad)}></path></svg>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Nothing found`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Autocomplete($$renderer, {
				options,
				getOptionLabel: (option) => option ? option.text : '',
				label: 'Custom Display',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				loading,
				error,
				match,
				noMatches,
				$$slots: { loading: true, error: true, match: true, noMatches: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: `);

		if (value) {
			$$renderer.push(`<!--[0--><svg style="height: 24px; vertical-align: middle;" viewBox="0 0 24 24">
    <path fill="currentColor"${$.attr('d', value.icon)}></path>
  </svg> ${$.escape(value.text)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></pre></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}