import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function Matcap($$anchor, $$props) {
	$.push($$props, true);

	const $hovering = () => $.store_get(hovering, '$hovering', $$stores);
	const $matcapsList = () => $.store_get(matcapsList, '$matcapsList', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const cache = useCache();

	const matcapsList = asyncWritable(cache.remember(
		async () => {
			const matcapListResponse = await fetch('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/matcaps.json');

			return await matcapListResponse.json();
		},
		['matcaps']
	));

	let format = $.prop($$props, 'format', 3, 256),
		width = $.prop($$props, 'width', 3, 5),
		height = $.prop($$props, 'height', 3, 5);

	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	const scale = new Spring(0.9);

	$.user_effect(() => {
		scale.set($hovering() ? 1 : 0.9);
	});

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

	const animDelay = $$props.gridIndex * 10;

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const fileName = $.derived(() => `${$matcapsList()[String($$props.matcapIndex)]}${getFormatString(format())}.png`);
			const url = $.derived(() => `${matcapRoot}/${format()}/${$.get(fileName)}`);
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => $.get(url), ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.await(node_2, () => useTexture($.get(url)), null, ($$anchor, matcap) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					{
						let $0 = $.derived(() => global(scaleTransition(true)));
						let $1 = $.derived(() => global(scaleTransition(true)));

						$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
							T_Group($$anchor, {
								get in() {
									return $.get($0);
								},

								get out() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => width() / 100 * scale.current);
										let $1 = $.derived(() => height() / 100 * scale.current);

										$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
											T_Mesh($$anchor, {
												get 'scale.x'() {
													return $.get($0);
												},

												get 'scale.y'() {
													return $.get($1);
												},

												get 'scale.z'() {
													return scale.current;
												},
												'position.z': 20,
												get onpointerenter() {
													return onPointerEnter;
												},

												get onpointerleave() {
													return onPointerLeave;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_5 = $.first_child(fragment_5);

													RoundedBoxGeometry(node_5, { args: [100, 100, 20], radius: 2 });

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => T.MeshMatcapMaterial, ($$anchor, T_MeshMatcapMaterial) => {
														T_MeshMatcapMaterial($$anchor, {
															get matcap() {
																return $.get(matcap);
															}
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
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

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($matcapsList()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}