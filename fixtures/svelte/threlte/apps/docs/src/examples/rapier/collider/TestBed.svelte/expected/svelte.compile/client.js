import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { AutoColliders } from '@threlte/rapier';
import { MathUtils } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-[500px] -translate-y-1/2 transform text-black"><h2> </h2> <div class="leading-normal"><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function TestBed($$anchor, $$props) {
	$.push($$props, true);

	let useGround = $.prop($$props, 'useGround', 3, true);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					position: [1, -0.5, 0],
					children: ($$anchor, $$slotProps) => {
						AutoColliders($$anchor, {
							shape: 'cuboid',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										receiveShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [12, 1, 10] });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, {});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (useGround()) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);
		let $1 = $.derived(() => -90 * MathUtils.DEG2RAD);

		HTML(node_5, {
			transform: true,
			get 'rotation.z'() {
				return $.get($0);
			},

			get 'rotation.x'() {
				return $.get($1);
			},
			'position.x': 5.8,
			pointerEvents: 'none',
			scale: 0.6,
			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var h2 = $.child(div);
				var text_1 = $.only_child(h2, true);
				var div_1 = $.sibling(h2, 2);
				var node_6 = $.child(div_1);

				$.snippet(node_6, () => $$props.text ?? $.noop);
				$.reset(div_1);
				$.reset(div);
				$.template_effect(() => $.set_text(text_1, $$props.title));
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	var node_7 = $.sibling(node_5, 2);

	$.snippet(node_7, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}