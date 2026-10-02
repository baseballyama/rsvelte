import * as $ from 'svelte/internal/server';
import { Tab, Tabs } from "components/Tabs";
import Image from "components/Image";
import Code from "docs/Code.svelte";
import tabs from "examples/tabs.txt";
import tabsWithContent from "examples/tabs-with-content.txt";

export default function Tabs_1($$renderer) {
	let loading = false;

	$$renderer.push(`<p>Tabs can be used as navigation elements like the ones you see on the top
  right. You need to bind current pathname as value prop for active indicator to
  work correctly.</p> `);

	Code($$renderer, { code: tabs });

	$$renderer.push(`<!----> <blockquote class="pl-8 mt-16 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/design/components/tabs.html#usage">Tabs organize and allow navigation between groups of content that are related
  and at the same level of hierarchy.</blockquote> <div style="max-width: 400px">`);

	Tabs($$renderer, {
		selected: '1',
		class: 'bg-black shadow-sm mt-6 text-white',
		color: 'secondary',
		loading,
		items: [
			{ id: '1', text: 'Cats', icon: 'alarm_on' },
			{ id: '2', text: 'Kittens', icon: 'bug_report' },
			{ id: '3', text: 'Kitties', icon: 'eject' }
		],
		$$slots: {
			content: ($$renderer) => {
				$$renderer.push(`<div slot="content" class="flex items-center content-center overflow-hidden w-full bg-gray-900 shadow h-full" style="height: 250px">`);

				Tab($$renderer, {
					id: '1',
					selected,
					children: ($$renderer) => {
						Image($$renderer, {
							alt: 'kitten 1',
							class: 'w-full',
							src: 'https://placekitten.com/400/250',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tab($$renderer, {
					id: '2',
					selected,
					children: ($$renderer) => {
						Image($$renderer, {
							alt: 'kitten 1',
							class: 'w-full',
							src: 'https://placekitten.com/400/251',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tab($$renderer, {
					id: '3',
					selected,
					children: ($$renderer) => {
						Image($$renderer, {
							alt: 'kitten 3',
							class: 'w-full',
							src: 'https://placekitten.com/400/253',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----></div> `);
	Code($$renderer, { code: tabsWithContent });
	$$renderer.push(`<!---->`);
}