import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Text as TitleText } from '@threlte/extras';
import { Container, Content, Text } from 'threlte-uikit';
import { Button } from 'threlte-uikit/kit';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Menu($$anchor, $$props) {
	let titleRef = $.state(void 0);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 1.5, -0.8],
			children: ($$anchor, $$slotProps) => {
				Container($$anchor, {
					anchorX: 'center',
					anchorY: 'center',
					pixelSize: 0.002,
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 16,
					padding: 32,
					backgroundColor: '#0e1625',
					borderColor: 'hotpink',
					borderWidth: 3,
					borderRadius: 16,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Content(node_1, {
							width: 320,
							height: 80,
							get ref() {
								return $.get(titleRef);
							},

							set ref($$value) {
								$.set(titleRef, $$value);
							},

							children: ($$anchor, $$slotProps) => {
								TitleText($$anchor, {
									anchorX: 'center',
									anchorY: 'middle',
									text: 'bonksaber!',
									font: '/fonts/adrip1.ttf',
									color: 'red',
									fontSize: 1,
									onsync: () => $.get(titleRef)?.notifyAncestorsChanged()
								});
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						Text(node_2, {
							text: 'objective: bonk the cubes as they fly by',
							fontSize: 16,
							color: 'white'
						});

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							get onclick() {
								return $$props.onstart;
							},
							size: 'lg',
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, { text: 'Start', fontSize: 22, color: '#555' });
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}