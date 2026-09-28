import * as $ from 'svelte/internal/server';
import Card from "../../components/Card";
import Button from "../../components/Button";
import Image from "../../components/Image";
import Code from "docs/Code.svelte";
import PropsTable from "docs/PropsTable.svelte";
import card from "examples/card.txt";

export default function Cards($$renderer) {
	if (Card.Card) {
		$$renderer.push('<!--[-->');

		Card.Card($$renderer, {
			class: 'dark:bg-gray-200',
			$$slots: {
				title: ($$renderer) => {
					$$renderer.push(`<div slot="title">`);

					if (Card.Title) {
						$$renderer.push('<!--[-->');

						Card.Title($$renderer, {
							class: 'dark:text-black',
							title: 'The three little kittens',
							subheader: 'A kitten poem',
							avatar: 'https://placekitten.com/64/64'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},

				media: ($$renderer) => {
					$$renderer.push(`<div slot="media">`);

					Image($$renderer, {
						class: 'w-full',
						src: 'https://placekitten.com/300/200',
						alt: 'kitty'
					});

					$$renderer.push(`<!----></div>`);
				},

				text: ($$renderer) => {
					$$renderer.push(`<div slot="text" class="p-5 pb-0 pt-3 text-gray-700 body-2">The three little kittens, they lost their mittens, <br/> And they began to cry, <br/> "Oh, mother dear, we sadly fear, <br/> That we have lost our mittens."</div>`);
				},

				actions: ($$renderer) => {
					$$renderer.push(`<div slot="actions"><div class="p-2">`);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->OK`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						text: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Meow`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	PropsTable($$renderer, {
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

	$$renderer.push(`<!----> `);
	Code($$renderer, { code: card });
	$$renderer.push(`<!---->`);
}