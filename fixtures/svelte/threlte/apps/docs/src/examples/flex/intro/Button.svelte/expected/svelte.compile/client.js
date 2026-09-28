import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { RoundedBoxGeometry, useCursor } from '@threlte/extras';
import { Box } from '@threlte/flex';
import Label from './Label.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	const $hovering = () => $.store_get(hovering, '$hovering', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let z = $.prop($$props, 'z', 3, 0),
		text = $.prop($$props, 'text', 3, '');

	const { hovering, onPointerEnter, onPointerLeave } = useCursor();

	{
		const children = ($$anchor, $$arg0) => {
			let width = () => ($$arg0?.()).width;
			let height = () => ($$arg0?.()).height;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					get 'position.z'() {
						return z();
					},

					onclick: (event) => {
						event.stopPropagation();
						$$props.onClick();
					},

					get onpointerenter() {
						return onPointerEnter;
					},

					get onpointerleave() {
						return onPointerLeave;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => [width(), height(), 10]);

							RoundedBoxGeometry(node_1, {
								get args() {
									return $.get($0);
								},
								radius: 5
							});
						}

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => $hovering() ? '#9D9FA3' : '#404550');

							$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, {
									get color() {
										return $.get($0);
									}
								});
							});
						}

						var node_3 = $.sibling(node_2, 2);

						Label(node_3, {
							z: 5.1,
							fontSize: 'xl',
							get text() {
								return text();
							}
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		Box($$anchor, {
			get class() {
				return $$props.class;
			},

			get order() {
				return $$props.order;
			},
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}