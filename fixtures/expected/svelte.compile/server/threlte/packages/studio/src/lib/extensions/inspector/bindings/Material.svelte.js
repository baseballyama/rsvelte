import * as $ from 'svelte/internal/server';
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

export default function Material($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import TransactionalTextureImage from './TransactionalTextureImage.svelte'
		let { objects } = $$props;

		const materials = $.derived(() => objects.map((o) => o.material));

		Folder($$renderer, {
			title: `material ${$.stringify(mutualType(materials()))}`,
			expanded: true,
			children: ($$renderer) => {
				if (haveProperty(materials(), 'visible')) {
					$$renderer.push('<!--[0-->');
					TransactionalBinding($$renderer, { objects: materials(), key: 'visible', label: 'visible' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'transparent')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'transparent',
						label: 'transparent'
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'opacity')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'opacity',
						label: 'opacity',
						options: { min: 0, max: 1 }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'color')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'color',
						label: 'color',
						options: { color: { type: 'float' } }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'emissive')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'emissive',
						label: 'emissive',
						options: { color: { type: 'float' } }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'emissiveIntensity')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'emissiveIntensity',
						label: 'emissiveIntensity',
						options: { min: 0 }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'envMapIntensity')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'envMapIntensity',
						label: 'envMapIntensity'
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'reflectivity')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'reflectivity',
						label: 'reflectivity',
						options: { min: 0, max: 1 }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'refractionRatio')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'refractionRatio',
						label: 'refractionRatio',
						options: { min: 0, max: 1 }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'shininess')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'shininess',
						label: 'shininess',
						options: { min: 0, max: 1 }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'isMeshStandardMaterial')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'roughness',
						label: 'roughness',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'metalness',
						label: 'metalness',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'isMeshPhysicalMaterial')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'clearcoat',
						label: 'clearcoat',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'clearcoatRoughness',
						label: 'clearcoatRoughness',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'transmission',
						label: 'transmission',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'ior',
						label: 'ior',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'sheen',
						label: 'sheen',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'sheenRoughness',
						label: 'sheenRoughness',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'attenuationColor',
						label: 'attenuationColor',
						options: { color: { type: 'float' } }
					});

					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'sheenColor',
						label: 'sheenColor',
						options: { color: { type: 'float' } }
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				TransactionalBinding($$renderer, { objects: materials(), key: 'alphaHash', label: 'alphaHash' });
				$$renderer.push(`<!----> `);
				TransactionalBinding($$renderer, { objects: materials(), key: 'alphaTest', label: 'alphaTest' });
				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'alphaToCoverage',
					label: 'alphaToCoverage'
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'blending',
					expanded: false,
					children: ($$renderer) => {
						TransactionalBinding($$renderer, { objects: materials(), key: 'blendAlpha', label: 'blendAlpha' });
						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'blendColor',
							label: 'blendColor',
							options: { color: { type: 'float' } }
						});

						$$renderer.push(`<!----> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'blendDst', label: 'blendDst' });
						$$renderer.push(`<!----> `);

						if (haveProperty(materials(), 'blendDstAlpha')) {
							$$renderer.push('<!--[0-->');

							TransactionalList($$renderer, {
								objects: materials(),
								key: 'blendDstAlpha',
								label: 'blendDstAlpha',
								options: {
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
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (haveProperty(materials(), 'blendEquationAlpha')) {
							$$renderer.push('<!--[0-->');

							TransactionalList($$renderer, {
								objects: materials(),
								key: 'blendEquationAlpha',
								label: 'blendEquationAlpha',
								options: {
									null: null,
									AddEquation,
									SubtractEquation,
									ReverseSubtractEquation,
									MinEquation,
									MaxEquation
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'blending', label: 'blending' });
						$$renderer.push(`<!----> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'blendSrc', label: 'blendSrc' });
						$$renderer.push(`<!----> `);

						if (haveProperty(materials(), 'blendSrcAlpha')) {
							$$renderer.push('<!--[0-->');

							TransactionalList($$renderer, {
								objects: materials(),
								key: 'blendSrcAlpha',
								label: 'blendSrcAlpha',
								options: {
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
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'clipIntersection',
					label: 'clipIntersection'
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'clipShadows',
					label: 'clipShadows'
				});

				$$renderer.push(`<!----> `);
				TransactionalBinding($$renderer, { objects: materials(), key: 'colorWrite', label: 'colorWrite' });
				$$renderer.push(`<!----> `);

				if (haveProperty(materials(), 'combine')) {
					$$renderer.push('<!--[0-->');

					TransactionalList($$renderer, {
						objects: materials(),
						key: 'combine',
						label: 'combine',
						options: { MultiplyOperation, MixOperation, AddOperation }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Folder($$renderer, {
					title: 'depth',
					expanded: false,
					children: ($$renderer) => {
						TransactionalBinding($$renderer, { objects: materials(), key: 'depthFunc', label: 'depthFunc' });
						$$renderer.push(`<!----> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'depthTest', label: 'depthTest' });
						$$renderer.push(`<!----> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'depthWrite', label: 'depthWrite' });
						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'forceSinglePass',
							label: 'forceSinglePass'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'stencil',
					expanded: false,
					children: ($$renderer) => {
						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilWrite',
							label: 'stencilWrite'
						});

						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilWriteMask',
							label: 'stencilWriteMask'
						});

						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilFunc',
							label: 'stencilFunc'
						});

						$$renderer.push(`<!----> `);
						TransactionalBinding($$renderer, { objects: materials(), key: 'stencilRef', label: 'stencilRef' });
						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilFuncMask',
							label: 'stencilFuncMask'
						});

						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilFail',
							label: 'stencilFail'
						});

						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilZFail',
							label: 'stencilZFail'
						});

						$$renderer.push(`<!----> `);

						TransactionalBinding($$renderer, {
							objects: materials(),
							key: 'stencilZPass',
							label: 'stencilZPass'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'polygonOffset',
					label: 'polygonOffset'
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'polygonOffsetFactor',
					label: 'polygonOffsetFactor'
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'polygonOffsetUnits',
					label: 'polygonOffsetUnits'
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'premultipliedAlpha',
					label: 'premultipliedAlpha'
				});

				$$renderer.push(`<!----> `);
				TransactionalBinding($$renderer, { objects: materials(), key: 'dithering', label: 'dithering' });
				$$renderer.push(`<!----> `);

				TransactionalList($$renderer, {
					objects: materials(),
					key: 'side',
					label: 'side',
					options: { FrontSide, BackSide, DoubleSide }
				});

				$$renderer.push(`<!----> `);

				if (haveProperty(materials(), 'shadowSide')) {
					$$renderer.push('<!--[0-->');

					TransactionalList($$renderer, {
						objects: materials(),
						key: 'shadowSide',
						label: 'shadowSide',
						options: { null: null, FrontSide, BackSide, DoubleSide }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				TransactionalBinding($$renderer, { objects: materials(), key: 'toneMapped', label: 'toneMapped' });
				$$renderer.push(`<!----> `);

				if (haveProperty(materials(), 'flatShading')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'flatShading',
						label: 'flatShading'
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'wireframe')) {
					$$renderer.push('<!--[0-->');
					TransactionalBinding($$renderer, { objects: materials(), key: 'wireframe', label: 'wireframe' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'fog')) {
					$$renderer.push('<!--[0-->');
					TransactionalBinding($$renderer, { objects: materials(), key: 'fog', label: 'fog' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'size')) {
					$$renderer.push('<!--[0-->');
					TransactionalBinding($$renderer, { objects: materials(), key: 'size', label: 'size' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(materials(), 'sizeAttenuation')) {
					$$renderer.push('<!--[0-->');

					TransactionalBinding($$renderer, {
						objects: materials(),
						key: 'sizeAttenuation',
						label: 'sizeAttenuation'
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				TransactionalBinding($$renderer, {
					objects: materials(),
					key: 'vertexColors',
					label: 'vertexColors'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}