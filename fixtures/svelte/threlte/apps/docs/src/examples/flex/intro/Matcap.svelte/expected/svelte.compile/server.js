import * as $ from 'svelte/internal/server';
import { asyncWritable, isInstanceOf, T, useCache } from '@threlte/core';

import {
	createTransition,
	global,
	RoundedBoxGeometry,
	useCursor,
	useTexture
} from '@threlte/extras';

import { cubicIn, cubicOut } from 'svelte/easing';
import { Spring } from 'svelte/motion';

export default function Matcap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const cache = useCache();

		const matcapsList = asyncWritable(cache.remember(
			async () => {
				const matcapListResponse = await fetch('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/matcaps.json');

				return await matcapListResponse.json();
			},
			['matcaps']
		));

		let { gridIndex, matcapIndex, format = 256, width = 5, height = 5 } = $$props;
		const { onPointerEnter, onPointerLeave, hovering } = useCursor();
		const scale = new Spring(0.9);
		const matcapRoot = 'https://rawcdn.githack.com/emmelleppi/matcaps/9b36ccaaf0a24881a39062d05566c9e92be4aa0d';

		function getFormatString(fmt) {
			switch (fmt) {
				case 64:
					return '-64px';

				case 128:
					return '-128px';

				case 256:
					return '-256px';

				case 512:
					return '-512px';

				default:
					return '';
			}
		}

		const animDelay = gridIndex * 10;

		const scaleTransition = (useDelay) => {
			return createTransition((ref, { direction }) => {
				if (!isInstanceOf(ref, 'Object3D')) return;

				return {
					tick(t) {
						ref.scale.setScalar(t);
					},
					delay: useDelay ? animDelay + (direction === 'in' ? 200 : 0) : 0,
					duration: 200,
					easing: direction === 'in' ? cubicOut : cubicIn
				};
			});
		};

		if ($.store_get($$store_subs ??= {}, '$matcapsList', matcapsList)) {
			$$renderer.push('<!--[0-->');

			const fileName = `${$.store_get($$store_subs ??= {}, '$matcapsList', matcapsList)[String(matcapIndex)]}${getFormatString(format)}.png`;
			const url = `${matcapRoot}/${format}/${fileName}`;

			$$renderer.push(`<!---->`);

			{
				$.await($$renderer, useTexture(url), () => {}, (matcap) => {
					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							in: global(scaleTransition(true)),
							out: global(scaleTransition(true)),
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										'scale.x': width / 100 * scale.current,
										'scale.y': height / 100 * scale.current,
										'scale.z': scale.current,
										'position.z': 20,
										onpointerenter: onPointerEnter,
										onpointerleave: onPointerLeave,
										children: ($$renderer) => {
											RoundedBoxGeometry($$renderer, { args: [100, 100, 20], radius: 2 });
											$$renderer.push(`<!----> `);

											if (T.MeshMatcapMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshMatcapMaterial($$renderer, { matcap });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}