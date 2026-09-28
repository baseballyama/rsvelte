import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "../../components/Card";
import Button from "../../components/Button";
import Image from "../../components/Image";
import Code from "docs/Code.svelte";
import PropsTable from "docs/PropsTable.svelte";
import card from "examples/card.txt";

var root = $.from_html(`<div slot="title"><!></div>`);
var root_1 = $.from_html(`<div slot="media"><!></div>`);
var root_2 = $.from_html(`<div slot="text" class="p-5 pb-0 pt-3 text-gray-700 body-2">The three little kittens, they lost their mittens, <br/> And they began to cry, <br/> "Oh, mother dear, we sadly fear, <br/> That we have lost our mittens."</div>`);
var root_3 = $.from_html(`<div slot="actions"><div class="p-2"><!> <!></div></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Cards($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Card, ($$anchor, Card_Card) => {
		Card_Card($$anchor, {
			class: 'dark:bg-gray-200',
			$$slots: {
				title: ($$anchor, $$slotProps) => {
					var div = root();
					var node_1 = $.child(div);

					$.component(node_1, () => Card.Title, ($$anchor, Card_Title) => {
						Card_Title($$anchor, {
							class: 'dark:text-black',
							title: 'The three little kittens',
							subheader: 'A kitten poem',
							avatar: 'https://placekitten.com/64/64'
						});
					});

					$.reset(div);
					$.append($$anchor, div);
				},

				media: ($$anchor, $$slotProps) => {
					var div_1 = root_1();
					var node_2 = $.child(div_1);

					Image(node_2, {
						class: 'w-full',
						src: 'https://placekitten.com/300/200',
						alt: 'kitty'
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},

				text: ($$anchor, $$slotProps) => {
					var div_2 = root_2();

					$.append($$anchor, div_2);
				},

				actions: ($$anchor, $$slotProps) => {
					var div_3 = root_3();
					var div_4 = $.child(div_3);
					var node_3 = $.child(div_4);

					Button(node_3, {
						text: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('OK');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						text: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Meow');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.reset(div_3);
					$.append($$anchor, div_3);
				}
			}
		});
	});

	var node_5 = $.sibling(node, 2);

	PropsTable(node_5, {
		data: [
			{
				prop: "hover",
				default: "true",
				description: "Enable hover elevation",
				type: "Boolean"
			},

			{
				prop: "elevation",
				default: "1",
				description: "Default elevation value",
				type: "Number"
			},

			{
				prop: "hoverElevation",
				default: "8",
				description: "Hover elevation value",
				type: "Number"
			},

			{
				prop: "classes",
				default: `rounded inline-flex flex-col overflow-hidden duration-200 ease-in`,
				description: "String of root element classes",
				type: "String"
			}
		]
	});

	var node_6 = $.sibling(node_5, 2);

	Code(node_6, {
		get code() {
			return card;
		}
	});

	$.append($$anchor, fragment);
}