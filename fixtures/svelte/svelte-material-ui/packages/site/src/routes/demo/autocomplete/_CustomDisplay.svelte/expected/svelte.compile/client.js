import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_svg(`<svg viewBox="0 0 24 24"><path fill="currentColor"></path></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_svg(
	`<svg style="height: 24px; vertical-align: middle;" viewBox="0 0 24 24">
    <path fill="currentColor"></path>
  </svg> `,
	1
);

var root_3 = $.from_html(`<div><!> <pre class="status">Selected: <!></pre></div>`);

export default function _CustomDisplay($$anchor) {
	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = $.proxy([
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
	]);

	let value = $.state(void 0);
	var div = root_3();
	var node = $.child(div);

	{
		const loading = ($$anchor) => {
			Text($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Loading...');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		const error = ($$anchor) => {
			Text($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Error while fetching suggestions.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		const match = ($$anchor, item = $.noop) => {
			var fragment_2 = root_1();
			var node_1 = $.first_child(fragment_2);

			Graphic(node_1, {
				children: ($$anchor, $$slotProps) => {
					var svg = root();
					var path = $.only_child(svg);

					$.template_effect(() => $.set_attribute(path, 'd', item().icon));
					$.append($$anchor, svg);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, item().text));
					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		};

		const noMatches = ($$anchor) => {
			var fragment_4 = root_1();
			var node_3 = $.first_child(fragment_4);

			Graphic(node_3, {
				children: ($$anchor, $$slotProps) => {
					var svg_1 = root();
					var path_1 = $.only_child(svg_1);

					$.template_effect(() => $.set_attribute(path_1, 'd', mdiEmoticonSad));
					$.append($$anchor, svg_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Nothing found');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		};

		Autocomplete(node, {
			get options() {
				return options;
			},
			getOptionLabel: (option) => option ? option.text : '',
			label: 'Custom Display',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			loading,
			error,
			match,
			noMatches,
			$$slots: { loading: true, error: true, match: true, noMatches: true }
		});
	}

	var pre = $.sibling(node, 2);
	var node_5 = $.sibling($.child(pre));

	{
		var consequent = ($$anchor) => {
			var fragment_5 = root_2();
			var svg_2 = $.first_child(fragment_5);
			var path_2 = $.sibling($.child(svg_2));

			$.next();
			$.reset(svg_2);

			var text_4 = $.sibling(svg_2);

			$.template_effect(() => {
				$.set_attribute(path_2, 'd', $.get(value).icon);
				$.set_text(text_4, ` ${$.get(value).text ?? ''}`);
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node_5, ($$render) => {
			if ($.get(value)) $$render(consequent);
		});
	}

	$.reset(pre);
	$.reset(div);
	$.append($$anchor, div);
}