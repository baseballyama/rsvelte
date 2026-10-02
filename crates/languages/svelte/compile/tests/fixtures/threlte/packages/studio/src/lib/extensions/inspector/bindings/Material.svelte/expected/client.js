import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Folder } from 'svelte-tweakpane-ui';

import {
	BackSide,
	DoubleSide,
	FrontSide,
	MultiplyOperation,
	MixOperation,
	AddOperation,
	ZeroFactor,
	OneFactor,
	SrcColorFactor,
	OneMinusSrcColorFactor,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	DstAlphaFactor,
	OneMinusDstAlphaFactor,
	AddEquation,
	SubtractEquation,
	ReverseSubtractEquation,
	MinEquation,
	MaxEquation,
	DstColorFactor,
	OneMinusDstColorFactor,
	SrcAlphaSaturateFactor,
	ConstantColorFactor,
	OneMinusConstantColorFactor,
	ConstantAlphaFactor,
	OneMinusConstantAlphaFactor
} from 'three';

import TransactionalBinding from './TransactionalBinding.svelte';
import TransactionalList from './TransactionalList.svelte';
import { haveProperty, mutualType } from './utils.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Material($$anchor, $$props) {
	$.push($$props, true);

	// import TransactionalTextureImage from './TransactionalTextureImage.svelte'
	const materials = $.derived(() => $$props.objects.map((o) => o.material));

	{
		let $0 = $.derived(() => mutualType($.get(materials)));

		Folder($$anchor, {
			get title() {
				return `material ${$.get($0) ?? ''}`;
			},
			expanded: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'visible',
							label: 'visible'
						});
					};

					var d = $.derived(() => haveProperty($.get(materials), 'visible'));

					$.if(node, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				var node_1 = $.sibling(node, 2);

				{
					var consequent_1 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'transparent',
							label: 'transparent',
							$$events: {
								change: () => {
									$.get(materials).forEach((material) => {
										material.needsUpdate = true;
									});
								}
							}
						});
					};

					var d_1 = $.derived(() => haveProperty($.get(materials), 'transparent'));

					$.if(node_1, ($$render) => {
						if ($.get(d_1)) $$render(consequent_1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'opacity',
							label: 'opacity',
							options: { min: 0, max: 1 }
						});
					};

					var d_2 = $.derived(() => haveProperty($.get(materials), 'opacity'));

					$.if(node_2, ($$render) => {
						if ($.get(d_2)) $$render(consequent_2);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_3 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'color',
							label: 'color',
							options: { color: { type: 'float' } }
						});
					};

					var d_3 = $.derived(() => haveProperty($.get(materials), 'color'));

					$.if(node_3, ($$render) => {
						if ($.get(d_3)) $$render(consequent_3);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent_4 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'emissive',
							label: 'emissive',
							options: { color: { type: 'float' } }
						});
					};

					var d_4 = $.derived(() => haveProperty($.get(materials), 'emissive'));

					$.if(node_4, ($$render) => {
						if ($.get(d_4)) $$render(consequent_4);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_5 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'emissiveIntensity',
							label: 'emissiveIntensity',
							options: { min: 0 }
						});
					};

					var d_5 = $.derived(() => haveProperty($.get(materials), 'emissiveIntensity'));

					$.if(node_5, ($$render) => {
						if ($.get(d_5)) $$render(consequent_5);
					});
				}

				var node_6 = $.sibling(node_5, 2);

				{
					var consequent_6 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'envMapIntensity',
							label: 'envMapIntensity'
						});
					};

					var d_6 = $.derived(() => haveProperty($.get(materials), 'envMapIntensity'));

					$.if(node_6, ($$render) => {
						if ($.get(d_6)) $$render(consequent_6);
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					var consequent_7 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'reflectivity',
							label: 'reflectivity',
							options: { min: 0, max: 1 }
						});
					};

					var d_7 = $.derived(() => haveProperty($.get(materials), 'reflectivity'));

					$.if(node_7, ($$render) => {
						if ($.get(d_7)) $$render(consequent_7);
					});
				}

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent_8 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'refractionRatio',
							label: 'refractionRatio',
							options: { min: 0, max: 1 }
						});
					};

					var d_8 = $.derived(() => haveProperty($.get(materials), 'refractionRatio'));

					$.if(node_8, ($$render) => {
						if ($.get(d_8)) $$render(consequent_8);
					});
				}

				var node_9 = $.sibling(node_8, 2);

				{
					var consequent_9 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'shininess',
							label: 'shininess',
							options: { min: 0, max: 1 }
						});
					};

					var d_9 = $.derived(() => haveProperty($.get(materials), 'shininess'));

					$.if(node_9, ($$render) => {
						if ($.get(d_9)) $$render(consequent_9);
					});
				}

				var node_10 = $.sibling(node_9, 2);

				{
					var consequent_10 = ($$anchor) => {
						var fragment_12 = root();
						var node_11 = $.first_child(fragment_12);

						TransactionalBinding(node_11, {
							get objects() {
								return $.get(materials);
							},
							key: 'roughness',
							label: 'roughness',
							options: { min: 0, max: 1 }
						});

						var node_12 = $.sibling(node_11, 2);

						TransactionalBinding(node_12, {
							get objects() {
								return $.get(materials);
							},
							key: 'metalness',
							label: 'metalness',
							options: { min: 0, max: 1 }
						});

						$.append($$anchor, fragment_12);
					};

					var d_10 = $.derived(() => haveProperty($.get(materials), 'isMeshStandardMaterial'));

					$.if(node_10, ($$render) => {
						if ($.get(d_10)) $$render(consequent_10);
					});
				}

				var node_13 = $.sibling(node_10, 2);

				{
					var consequent_11 = ($$anchor) => {
						var fragment_13 = root_1();
						var node_14 = $.first_child(fragment_13);

						TransactionalBinding(node_14, {
							get objects() {
								return $.get(materials);
							},
							key: 'clearcoat',
							label: 'clearcoat',
							options: { min: 0, max: 1 }
						});

						var node_15 = $.sibling(node_14, 2);

						TransactionalBinding(node_15, {
							get objects() {
								return $.get(materials);
							},
							key: 'clearcoatRoughness',
							label: 'clearcoatRoughness',
							options: { min: 0, max: 1 }
						});

						var node_16 = $.sibling(node_15, 2);

						TransactionalBinding(node_16, {
							get objects() {
								return $.get(materials);
							},
							key: 'transmission',
							label: 'transmission',
							options: { min: 0, max: 1 }
						});

						var node_17 = $.sibling(node_16, 2);

						TransactionalBinding(node_17, {
							get objects() {
								return $.get(materials);
							},
							key: 'ior',
							label: 'ior',
							options: { min: 0, max: 1 }
						});

						var node_18 = $.sibling(node_17, 2);

						TransactionalBinding(node_18, {
							get objects() {
								return $.get(materials);
							},
							key: 'sheen',
							label: 'sheen',
							options: { min: 0, max: 1 }
						});

						var node_19 = $.sibling(node_18, 2);

						TransactionalBinding(node_19, {
							get objects() {
								return $.get(materials);
							},
							key: 'sheenRoughness',
							label: 'sheenRoughness',
							options: { min: 0, max: 1 }
						});

						var node_20 = $.sibling(node_19, 2);

						TransactionalBinding(node_20, {
							get objects() {
								return $.get(materials);
							},
							key: 'attenuationColor',
							label: 'attenuationColor',
							options: { color: { type: 'float' } }
						});

						var node_21 = $.sibling(node_20, 2);

						TransactionalBinding(node_21, {
							get objects() {
								return $.get(materials);
							},
							key: 'sheenColor',
							label: 'sheenColor',
							options: { color: { type: 'float' } }
						});

						$.append($$anchor, fragment_13);
					};

					var d_11 = $.derived(() => haveProperty($.get(materials), 'isMeshPhysicalMaterial'));

					$.if(node_13, ($$render) => {
						if ($.get(d_11)) $$render(consequent_11);
					});
				}

				var node_22 = $.sibling(node_13, 2);

				TransactionalBinding(node_22, {
					get objects() {
						return $.get(materials);
					},
					key: 'alphaHash',
					label: 'alphaHash'
				});

				var node_23 = $.sibling(node_22, 2);

				TransactionalBinding(node_23, {
					get objects() {
						return $.get(materials);
					},
					key: 'alphaTest',
					label: 'alphaTest'
				});

				var node_24 = $.sibling(node_23, 2);

				TransactionalBinding(node_24, {
					get objects() {
						return $.get(materials);
					},
					key: 'alphaToCoverage',
					label: 'alphaToCoverage'
				});

				var node_25 = $.sibling(node_24, 2);

				Folder(node_25, {
					title: 'blending',
					expanded: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_14 = root_1();
						var node_26 = $.first_child(fragment_14);

						TransactionalBinding(node_26, {
							get objects() {
								return $.get(materials);
							},
							key: 'blendAlpha',
							label: 'blendAlpha'
						});

						var node_27 = $.sibling(node_26, 2);

						TransactionalBinding(node_27, {
							get objects() {
								return $.get(materials);
							},
							key: 'blendColor',
							label: 'blendColor',
							options: { color: { type: 'float' } }
						});

						var node_28 = $.sibling(node_27, 2);

						TransactionalBinding(node_28, {
							get objects() {
								return $.get(materials);
							},
							key: 'blendDst',
							label: 'blendDst'
						});

						var node_29 = $.sibling(node_28, 2);

						{
							var consequent_12 = ($$anchor) => {
								{
									let $0 = $.derived(() => ({
										null: null,
										ZeroFactor,
										OneFactor,
										SrcColorFactor,
										OneMinusSrcColorFactor,
										SrcAlphaFactor,
										OneMinusSrcAlphaFactor,
										DstAlphaFactor,
										OneMinusDstAlphaFactor,
										DstColorFactor,
										OneMinusDstColorFactor,
										SrcAlphaSaturateFactor,
										ConstantColorFactor,
										OneMinusConstantColorFactor,
										ConstantAlphaFactor,
										OneMinusConstantAlphaFactor
									}));

									TransactionalList($$anchor, {
										get objects() {
											return $.get(materials);
										},
										key: 'blendDstAlpha',
										label: 'blendDstAlpha',
										get options() {
											return $.get($0);
										}
									});
								}
							};

							var d_12 = $.derived(() => haveProperty($.get(materials), 'blendDstAlpha'));

							$.if(node_29, ($$render) => {
								if ($.get(d_12)) $$render(consequent_12);
							});
						}

						var node_30 = $.sibling(node_29, 2);

						{
							var consequent_13 = ($$anchor) => {
								{
									let $0 = $.derived(() => ({
										null: null,
										AddEquation,
										SubtractEquation,
										ReverseSubtractEquation,
										MinEquation,
										MaxEquation
									}));

									TransactionalList($$anchor, {
										get objects() {
											return $.get(materials);
										},
										key: 'blendEquationAlpha',
										label: 'blendEquationAlpha',
										get options() {
											return $.get($0);
										}
									});
								}
							};

							var d_13 = $.derived(() => haveProperty($.get(materials), 'blendEquationAlpha'));

							$.if(node_30, ($$render) => {
								if ($.get(d_13)) $$render(consequent_13);
							});
						}

						var node_31 = $.sibling(node_30, 2);

						TransactionalBinding(node_31, {
							get objects() {
								return $.get(materials);
							},
							key: 'blending',
							label: 'blending'
						});

						var node_32 = $.sibling(node_31, 2);

						TransactionalBinding(node_32, {
							get objects() {
								return $.get(materials);
							},
							key: 'blendSrc',
							label: 'blendSrc'
						});

						var node_33 = $.sibling(node_32, 2);

						{
							var consequent_14 = ($$anchor) => {
								{
									let $0 = $.derived(() => ({
										null: null,
										ZeroFactor,
										OneFactor,
										SrcColorFactor,
										OneMinusSrcColorFactor,
										SrcAlphaFactor,
										OneMinusSrcAlphaFactor,
										DstAlphaFactor,
										OneMinusDstAlphaFactor,
										DstColorFactor,
										OneMinusDstColorFactor,
										SrcAlphaSaturateFactor,
										ConstantColorFactor,
										OneMinusConstantColorFactor,
										ConstantAlphaFactor,
										OneMinusConstantAlphaFactor
									}));

									TransactionalList($$anchor, {
										get objects() {
											return $.get(materials);
										},
										key: 'blendSrcAlpha',
										label: 'blendSrcAlpha',
										get options() {
											return $.get($0);
										}
									});
								}
							};

							var d_14 = $.derived(() => haveProperty($.get(materials), 'blendSrcAlpha'));

							$.if(node_33, ($$render) => {
								if ($.get(d_14)) $$render(consequent_14);
							});
						}

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});

				var node_34 = $.sibling(node_25, 2);

				TransactionalBinding(node_34, {
					get objects() {
						return $.get(materials);
					},
					key: 'clipIntersection',
					label: 'clipIntersection'
				});

				var node_35 = $.sibling(node_34, 2);

				TransactionalBinding(node_35, {
					get objects() {
						return $.get(materials);
					},
					key: 'clipShadows',
					label: 'clipShadows'
				});

				var node_36 = $.sibling(node_35, 2);

				TransactionalBinding(node_36, {
					get objects() {
						return $.get(materials);
					},
					key: 'colorWrite',
					label: 'colorWrite'
				});

				var node_37 = $.sibling(node_36, 2);

				{
					var consequent_15 = ($$anchor) => {
						{
							let $0 = $.derived(() => ({ MultiplyOperation, MixOperation, AddOperation }));

							TransactionalList($$anchor, {
								get objects() {
									return $.get(materials);
								},
								key: 'combine',
								label: 'combine',
								get options() {
									return $.get($0);
								}
							});
						}
					};

					var d_15 = $.derived(() => haveProperty($.get(materials), 'combine'));

					$.if(node_37, ($$render) => {
						if ($.get(d_15)) $$render(consequent_15);
					});
				}

				var node_38 = $.sibling(node_37, 2);

				Folder(node_38, {
					title: 'depth',
					expanded: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_19 = root_2();
						var node_39 = $.first_child(fragment_19);

						TransactionalBinding(node_39, {
							get objects() {
								return $.get(materials);
							},
							key: 'depthFunc',
							label: 'depthFunc'
						});

						var node_40 = $.sibling(node_39, 2);

						TransactionalBinding(node_40, {
							get objects() {
								return $.get(materials);
							},
							key: 'depthTest',
							label: 'depthTest'
						});

						var node_41 = $.sibling(node_40, 2);

						TransactionalBinding(node_41, {
							get objects() {
								return $.get(materials);
							},
							key: 'depthWrite',
							label: 'depthWrite'
						});

						var node_42 = $.sibling(node_41, 2);

						TransactionalBinding(node_42, {
							get objects() {
								return $.get(materials);
							},
							key: 'forceSinglePass',
							label: 'forceSinglePass'
						});

						$.append($$anchor, fragment_19);
					},
					$$slots: { default: true }
				});

				var node_43 = $.sibling(node_38, 2);

				Folder(node_43, {
					title: 'stencil',
					expanded: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_20 = root_1();
						var node_44 = $.first_child(fragment_20);

						TransactionalBinding(node_44, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilWrite',
							label: 'stencilWrite'
						});

						var node_45 = $.sibling(node_44, 2);

						TransactionalBinding(node_45, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilWriteMask',
							label: 'stencilWriteMask'
						});

						var node_46 = $.sibling(node_45, 2);

						TransactionalBinding(node_46, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilFunc',
							label: 'stencilFunc'
						});

						var node_47 = $.sibling(node_46, 2);

						TransactionalBinding(node_47, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilRef',
							label: 'stencilRef'
						});

						var node_48 = $.sibling(node_47, 2);

						TransactionalBinding(node_48, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilFuncMask',
							label: 'stencilFuncMask'
						});

						var node_49 = $.sibling(node_48, 2);

						TransactionalBinding(node_49, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilFail',
							label: 'stencilFail'
						});

						var node_50 = $.sibling(node_49, 2);

						TransactionalBinding(node_50, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilZFail',
							label: 'stencilZFail'
						});

						var node_51 = $.sibling(node_50, 2);

						TransactionalBinding(node_51, {
							get objects() {
								return $.get(materials);
							},
							key: 'stencilZPass',
							label: 'stencilZPass'
						});

						$.append($$anchor, fragment_20);
					},
					$$slots: { default: true }
				});

				var node_52 = $.sibling(node_43, 2);

				TransactionalBinding(node_52, {
					get objects() {
						return $.get(materials);
					},
					key: 'polygonOffset',
					label: 'polygonOffset'
				});

				var node_53 = $.sibling(node_52, 2);

				TransactionalBinding(node_53, {
					get objects() {
						return $.get(materials);
					},
					key: 'polygonOffsetFactor',
					label: 'polygonOffsetFactor'
				});

				var node_54 = $.sibling(node_53, 2);

				TransactionalBinding(node_54, {
					get objects() {
						return $.get(materials);
					},
					key: 'polygonOffsetUnits',
					label: 'polygonOffsetUnits'
				});

				var node_55 = $.sibling(node_54, 2);

				TransactionalBinding(node_55, {
					get objects() {
						return $.get(materials);
					},
					key: 'premultipliedAlpha',
					label: 'premultipliedAlpha'
				});

				var node_56 = $.sibling(node_55, 2);

				TransactionalBinding(node_56, {
					get objects() {
						return $.get(materials);
					},
					key: 'dithering',
					label: 'dithering'
				});

				var node_57 = $.sibling(node_56, 2);

				{
					let $0 = $.derived(() => ({ FrontSide, BackSide, DoubleSide }));

					TransactionalList(node_57, {
						get objects() {
							return $.get(materials);
						},
						key: 'side',
						label: 'side',
						get options() {
							return $.get($0);
						}
					});
				}

				var node_58 = $.sibling(node_57, 2);

				{
					var consequent_16 = ($$anchor) => {
						{
							let $0 = $.derived(() => ({ null: null, FrontSide, BackSide, DoubleSide }));

							TransactionalList($$anchor, {
								get objects() {
									return $.get(materials);
								},
								key: 'shadowSide',
								label: 'shadowSide',
								get options() {
									return $.get($0);
								}
							});
						}
					};

					var d_16 = $.derived(() => haveProperty($.get(materials), 'shadowSide'));

					$.if(node_58, ($$render) => {
						if ($.get(d_16)) $$render(consequent_16);
					});
				}

				var node_59 = $.sibling(node_58, 2);

				TransactionalBinding(node_59, {
					get objects() {
						return $.get(materials);
					},
					key: 'toneMapped',
					label: 'toneMapped'
				});

				var node_60 = $.sibling(node_59, 2);

				{
					var consequent_17 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'flatShading',
							label: 'flatShading'
						});
					};

					var d_17 = $.derived(() => haveProperty($.get(materials), 'flatShading'));

					$.if(node_60, ($$render) => {
						if ($.get(d_17)) $$render(consequent_17);
					});
				}

				var node_61 = $.sibling(node_60, 2);

				{
					var consequent_18 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'wireframe',
							label: 'wireframe'
						});
					};

					var d_18 = $.derived(() => haveProperty($.get(materials), 'wireframe'));

					$.if(node_61, ($$render) => {
						if ($.get(d_18)) $$render(consequent_18);
					});
				}

				var node_62 = $.sibling(node_61, 2);

				{
					var consequent_19 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'fog',
							label: 'fog'
						});
					};

					var d_19 = $.derived(() => haveProperty($.get(materials), 'fog'));

					$.if(node_62, ($$render) => {
						if ($.get(d_19)) $$render(consequent_19);
					});
				}

				var node_63 = $.sibling(node_62, 2);

				{
					var consequent_20 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'size',
							label: 'size'
						});
					};

					var d_20 = $.derived(() => haveProperty($.get(materials), 'size'));

					$.if(node_63, ($$render) => {
						if ($.get(d_20)) $$render(consequent_20);
					});
				}

				var node_64 = $.sibling(node_63, 2);

				{
					var consequent_21 = ($$anchor) => {
						TransactionalBinding($$anchor, {
							get objects() {
								return $.get(materials);
							},
							key: 'sizeAttenuation',
							label: 'sizeAttenuation'
						});
					};

					var d_21 = $.derived(() => haveProperty($.get(materials), 'sizeAttenuation'));

					$.if(node_64, ($$render) => {
						if ($.get(d_21)) $$render(consequent_21);
					});
				}

				var node_65 = $.sibling(node_64, 2);

				TransactionalBinding(node_65, {
					get objects() {
						return $.get(materials);
					},
					key: 'vertexColors',
					label: 'vertexColors'
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}