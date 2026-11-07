import * as $ from 'svelte/internal/server';
import { useTask, useThrelte } from '@threlte/core';
import { interactivity, transitions } from '@threlte/extras';
import { Box } from '@threlte/flex';
import { tick } from 'svelte';
import Button from './Button.svelte';
import Label from './Label.svelte';
import Matcap from './Matcap.svelte';
import Window from './Window.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { windowWidth, windowHeight, rows = 5, columns = 5, size } = $$props;
		let page = 1;
		let offset = $.derived(() => (page - 1) * rows * columns);

		interactivity();
		transitions();

		const { renderStage, autoRender, renderer, scene, camera } = useThrelte();

		autoRender.set(false);

		useTask(
			async () => {
				await tick();
				renderer.render(scene, camera.current);
			},
			{ stage: renderStage, autoInvalidate: false }
		);

		Window($$renderer, {
			title: 'Matcaps',
			width: windowWidth,
			height: windowHeight,
			children: ($$renderer) => {
				Box($$renderer, {
					class: 'h-full w-full flex-col items-stretch gap-10 p-10',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(new Array(rows));

						for (let rowIndex = 0, $$length = each_array.length; rowIndex < $$length; rowIndex++) {
							let _ = each_array[rowIndex];

							Box($$renderer, {
								class: 'h-auto w-full flex-1 items-center justify-evenly gap-10',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(new Array(columns));

									for (let columnIndex = 0,
										$$length = each_array_1.length; columnIndex < $$length; columnIndex++) {
										let _ = each_array_1[columnIndex];
										const index = rowIndex * columns + columnIndex;

										{
											function children($$renderer, { width, height }) {
												Matcap($$renderer, {
													width,
													height,
													matcapIndex: offset() + index,
													gridIndex: index,
													format: size
												});
											}

											Box($$renderer, {
												class: 'h-full w-full flex-1',
												children,
												$$slots: { default: true }
											});
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--> `);

						Box($$renderer, {
							order: 999,
							class: 'h-40 w-auto items-center justify-center gap-10',
							children: ($$renderer) => {
								Button($$renderer, {
									class: 'h-full w-auto flex-1',
									z: 15,
									text: '← PREVIOUS PAGE',
									order: 0,
									onClick: () => {
										page = Math.max(1, page - 1);
									}
								});

								$$renderer.push(`<!----> `);

								Box($$renderer, {
									class: 'h-full w-auto flex-1',
									order: 1,
									children: ($$renderer) => {
										Label($$renderer, { z: 10.1, fontSize: 'xl', text: `PAGE: ${page}` });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									class: 'h-full w-auto flex-1',
									z: 15,
									text: 'NEXT PAGE →',
									order: 2,
									onClick: () => {
										page = Math.min(10, page + 1);
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}