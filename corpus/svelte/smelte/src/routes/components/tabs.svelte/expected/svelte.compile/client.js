import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, Tabs } from "components/Tabs";
import Image from "components/Image";
import Code from "docs/Code.svelte";
import tabs from "examples/tabs.txt";
import tabsWithContent from "examples/tabs-with-content.txt";

var root = $.from_html(`<div slot="content" class="flex items-center content-center overflow-hidden w-full bg-gray-900 shadow h-full" style="height: 250px"><!> <!> <!></div>`);

var root_1 = $.from_html(
	`<p>Tabs can be used as navigation elements like the ones you see on the top
  right. You need to bind current pathname as value prop for active indicator to
  work correctly.</p> <!> <blockquote class="pl-8 mt-16 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/design/components/tabs.html#usage">Tabs organize and allow navigation between groups of content that are related
  and at the same level of hierarchy.</blockquote> <div style="max-width: 400px"><!></div> <!>`,
	1
);

export default function Tabs_1($$anchor) {
	let loading = false;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Code(node, {
		get code() {
			return tabs;
		}
	});

	var div = $.sibling(node, 4);
	var node_1 = $.child(div);

	Tabs(node_1, {
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
			content: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_2 = $.child(div_1);

				Tab(node_2, {
					id: '1',
					selected,
					children: ($$anchor, $$slotProps) => {
						Image($$anchor, {
							alt: 'kitten 1',
							class: 'w-full',
							src: 'https://placekitten.com/400/250',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Tab(node_3, {
					id: '2',
					selected,
					children: ($$anchor, $$slotProps) => {
						Image($$anchor, {
							alt: 'kitten 1',
							class: 'w-full',
							src: 'https://placekitten.com/400/251',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Tab(node_4, {
					id: '3',
					selected,
					children: ($$anchor, $$slotProps) => {
						Image($$anchor, {
							alt: 'kitten 3',
							class: 'w-full',
							src: 'https://placekitten.com/400/253',
							width: '400',
							height: '250'
						});
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	Code(node_5, {
		get code() {
			return tabsWithContent;
		}
	});

	$.append($$anchor, fragment);
}