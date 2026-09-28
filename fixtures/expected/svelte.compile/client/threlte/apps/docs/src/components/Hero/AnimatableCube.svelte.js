import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';
import KeyboardControls from './KeyboardControls.svelte';
import { cubeGeometry } from './state';
import DissolveMaterial from './materials/DissolveMaterial.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function AnimatableCube($$anchor, $$props) {
	const $cubeGeometry = () => $.store_get(cubeGeometry, '$cubeGeometry', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	{
		const children = ($$anchor, $$arg0) => {
			let Transform = () => ($$arg0?.()).Transform;
			let Sync = () => ($$arg0?.()).Sync;
			let Declare = () => ($$arg0?.()).Declare;

			{
				const children = ($$anchor, $$arg0) => {
					let transform = () => ($$arg0?.()).transform;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, Transform, ($$anchor, Transform_1) => {
						Transform_1($$anchor, $.spread_props(transform, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										frustumCulled: false,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_2 = $.first_child(fragment_4);

											{
												var consequent = ($$anchor) => {
													T($$anchor, {
														get is() {
															return $cubeGeometry();
														},
														dispose: false
													});
												};

												$.if(node_2, ($$render) => {
													if ($cubeGeometry()) $$render(consequent);
												});
											}

											var node_3 = $.sibling(node_2, 2);

											{
												const children = ($$anchor, values = $.noop) => {
													DissolveMaterial($$anchor, {
														get progress() {
															return values().values.progress;
														},

														get scale() {
															return values().values.noiseScale;
														},
														transparent: true,
														roughness: 0.418,
														metalness: 0.6139,
														color: '#ff1f00',
														emissive: '#000105',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_4 = $.first_child(fragment_7);

															$.component(node_4, Sync, ($$anchor, Sync_1) => {
																Sync_1($$anchor, {
																	color: true,
																	opacity: true,
																	emissive: true,
																	roughness: true,
																	metalness: true
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												};

												$.component(node_3, Declare, ($$anchor, Declare_1) => {
													Declare_1($$anchor, {
														props: { progress: 0, noiseScale: 1 },
														children,
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					});

					$.append($$anchor, fragment_2);
				};

				KeyboardControls($$anchor, { children, $$slots: { default: true } });
			}
		};

		SheetObject($$anchor, {
			get key() {
				return $$props.key;
			},
			children,
			$$slots: { default: true }
		});
	}

	$$cleanup();
}