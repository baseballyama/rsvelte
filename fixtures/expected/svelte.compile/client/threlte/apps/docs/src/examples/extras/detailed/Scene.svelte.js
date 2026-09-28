import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Detailed } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ color: 0xff_00_00, distance: 0 },
		{ color: 0x00_ff_00, distance: 3 },
		{ color: 0x00_00_ff, distance: 6 }
	];

	let detailed = $.state(void 0);
	let time = 0;

	useTask((delta) => {
		time += delta;
		$.get(detailed)?.position.setZ(3 * Math.sin(time));
	});

	Detailed($$anchor, {
		get ref() {
			return $.get(detailed);
		},

		set ref($$value) {
			$.set(detailed, $$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, $.index, ($$anchor, $$item, i) => {
				let color = () => $.get($$item).color;
				let distance = () => $.get($$item).distance;
				const detail = $.derived(() => items.length - i - 1);
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						get distance() {
							return distance();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => [1, $.get(detail)]);

								$.component(node_2, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
									T_IcosahedronGeometry($$anchor, {
										get args() {
											return $.get($0);
										}
									});
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, {
									wireframe: true,
									get color() {
										return color();
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}