import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, injectPlugin } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let attached = $.prop($$props, 'attached', 3, true);

	injectPlugin('plugin-name', (args) => {
		$$props.plugin?.fn(args);

		if ($$props.plugin?.props) {
			return { pluginProps: $$props.plugin.props };
		}

		return;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get dispose() {
						return $$props.dispose;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Group, ($$anchor, T_Group_1) => {
							T_Group_1($$anchor, {
								name: 'parent',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											name: 'child',
											lookat: [0, 0, 0],
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => T.BufferGeometry, ($$anchor, T_BufferGeometry) => {
													T_BufferGeometry($$anchor, { name: 'geometry' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
													T_MeshBasicMaterial($$anchor, {
														name: 'material',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => T.Texture, ($$anchor, T_Texture) => {
																T_Texture($$anchor, { attach: 'map', name: 'texture' });
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
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
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (attached()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}