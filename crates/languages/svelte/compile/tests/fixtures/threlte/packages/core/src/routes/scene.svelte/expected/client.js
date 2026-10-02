import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Color } from 'three';
import { injectPlugin, isInstanceOf, T, useThrelte } from '../lib/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();

	scene.background = new Color('black');

	let posY = $.state(0);
	let makeDefault = $.state(false);
	let show = $.state(false);
	let height = $.state(1);

	window.addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			$.set(posY, $.get(posY) + 1);
		}

		if (e.key === 'Enter') {
			$.set(makeDefault, !$.get(makeDefault));
		}

		if (e.key === 's') {
			$.set(show, !$.get(show));
		}

		if (e.key === 'h') {
			$.set(height, $.get(height) + 1);
		}
	});

	injectPlugin('test-plugin', (args) => {
		$.user_effect(() => {
			if (isInstanceOf(args.ref, 'PerspectiveCamera')) {
				console.log(args.makeDefault);
			}
		});
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			get makeDefault() {
				return $.get(makeDefault);
			},
			position: [10, 10, 10],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.Color, ($$anchor, T_Color) => {
					T_Color($$anchor, { args: ['blue'], attach: 'material.color' });
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
								T_Mesh_1($$anchor, {
									get 'position.y'() {
										return $.get(posY);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
											T_MeshBasicMaterial_1($$anchor, { color: 'blue' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
											T_SphereGeometry($$anchor, {});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_9 = $.first_child(fragment_4);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_10 = $.first_child(fragment_5);

						$.component(node_10, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
							T_MeshBasicMaterial_2($$anchor, {});
						});

						var node_11 = $.sibling(node_10, 2);

						{
							let $0 = $.derived(() => [1, $.get(height), 1]);

							$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
								T_BoxGeometry_1($$anchor, {
									get args() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_8, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}