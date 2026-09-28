import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { RoundedBoxGeometry } from '@threlte/extras';
import { Box, Flex, tailwindParser } from '@threlte/flex';
import Circle from './Circle.svelte';
import Label from './Label.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Window($$anchor, $$props) {
	let width = $.prop($$props, 'width', 3, 500),
		height = $.prop($$props, 'height', 3, 400);

	Flex($$anchor, {
		get classParser() {
			return tailwindParser;
		},

		get width() {
			return width();
		},

		get height() {
			return height();
		},
		class: 'flex-col gap-1 p-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => [width(), height(), 20]);

							RoundedBoxGeometry(node_1, {
								get args() {
									return $.get($0);
								},
								radius: 6
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, { color: '#0A0F19' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let height = () => ($$arg0?.()).height;
					let width = () => ($$arg0?.()).width;
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							'position.z': 20,
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => [width(), height(), 20]);

									RoundedBoxGeometry(node_5, {
										get args() {
											return $.get($0);
										},
										radius: 5
									});
								}

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
									T_MeshBasicMaterial_1($$anchor, { color: '#ddd' });
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_4, 2);

					Box(node_7, {
						class: 'h-10 w-10',
						children: ($$anchor, $$slotProps) => {
							Circle($$anchor, { radius: 5, color: '#FF6057', z: 30.01 });
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Box(node_8, {
						class: 'h-10 w-10',
						children: ($$anchor, $$slotProps) => {
							Circle($$anchor, { radius: 5, color: '#FDBD2E', z: 30.01 });
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Box(node_9, {
						class: 'h-10 w-10',
						children: ($$anchor, $$slotProps) => {
							Circle($$anchor, { radius: 5, color: '#27C840', z: 30.01 });
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Box(node_10, {
						class: 'h-full w-auto flex-1 items-center justify-center',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								get text() {
									return $$props.title;
								},
								z: 30.01,
								fontStyle: 'semi-bold',
								fontSize: 'l',
								color: '#454649'
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				};

				Box(node_3, {
					class: 'h-26 w-full items-center justify-start gap-5 pr-53 pl-8',
					children,
					$$slots: { default: true }
				});
			}

			var node_11 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;
					var fragment_9 = $.comment();
					var node_12 = $.first_child(fragment_9);

					$.snippet(node_12, () => $$props.children ?? $.noop, () => ({ width: width(), height: height() }));
					$.append($$anchor, fragment_9);
				};

				Box(node_11, {
					class: 'h-auto w-auto flex-1',
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}