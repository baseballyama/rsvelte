import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Edges, Text, useCursor } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { MathUtils } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'text', 'onClick']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const buttonOffsetY = new Spring(0);
	let buttonColor = $.state('#111111');
	let textColor = $.state('#eedbcb');
	const { onPointerEnter, onPointerLeave } = useCursor();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => 0.05 - buttonOffsetY.current);

					$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							get 'position.y'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										get onclick() {
											return $$props.onClick;
										},

										onpointerenter: (e) => {
											e.stopPropagation();
											$.set(buttonColor, '#eedbcb');
											$.set(textColor, '#111111');
											onPointerEnter();
										},

										onpointerleave: (e) => {
											e.stopPropagation();
											$.set(buttonColor, '#111111');
											$.set(textColor, '#eedbcb');
											buttonOffsetY.set(0);
											onPointerLeave();
										},

										onpointerdown: (e) => {
											e.stopPropagation();
											buttonOffsetY.set(0.05);
										},

										onpointerup: (e) => {
											e.stopPropagation();
											buttonOffsetY.set(0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [1.2, 0.1, 0.8] });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, {
													get color() {
														return $.get(buttonColor);
													}
												});
											});

											var node_5 = $.sibling(node_4, 2);

											Edges(node_5, { color: 'black', raycast: () => null });
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_2, 2);

								{
									let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

									Text(node_6, {
										renderOrder: -100,
										ignorePointer: true,
										get color() {
											return $.get(textColor);
										},

										get text() {
											return $$props.text;
										},

										get 'rotation.x'() {
											return $.get($0);
										},
										'position.y': 0.055,
										fontSize: 0.35,
										anchorX: '50%',
										anchorY: '50%'
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}