import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OrbitControls, Resize, useGltf } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let resize = $.prop($$props, 'resize', 3, true);
	const names = ['Duck', 'Flower', 'Fox'];
	const promises = Promise.all(names.map((name) => useGltf(`/models/${name}.glb`)));
	const increment = 2 * Math.PI / names.length;
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 5, 5],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [1, 5, 3] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => promises, null, ($$anchor, objects) => {
		var fragment_2 = $.comment();
		var node_4 = $.first_child(fragment_2);

		$.each(node_4, 17, () => $.get(objects), $.index, ($$anchor, $$item, i) => {
			let scene = () => $.get($$item).scene;
			const r = $.derived(() => increment * i);
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => Math.cos($.get(r)));
				let $1 = $.derived(() => Math.sin($.get(r)));

				$.component(node_5, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get 'position.x'() {
							return $.get($0);
						},

						get 'position.z'() {
							return $.get($1);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									Resize($$anchor, {
										children: ($$anchor, $$slotProps) => {
											T($$anchor, {
												get is() {
													return scene();
												}
											});
										},
										$$slots: { default: true }
									});
								};

								var alternate = ($$anchor) => {
									T($$anchor, {
										get is() {
											return scene();
										}
									});
								};

								$.if(node_6, ($$render) => {
									if (resize()) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		});

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
	$.pop();
}