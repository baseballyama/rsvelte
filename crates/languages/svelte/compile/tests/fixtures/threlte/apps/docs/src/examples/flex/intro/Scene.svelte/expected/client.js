import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';
import { interactivity, transitions } from '@threlte/extras';
import { Box } from '@threlte/flex';
import { tick } from 'svelte';
import Button from './Button.svelte';
import Label from './Label.svelte';
import Matcap from './Matcap.svelte';
import Window from './Window.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 3, 5),
		columns = $.prop($$props, 'columns', 3, 5);

	let page = $.state(1);
	let offset = $.derived(() => ($.get(page) - 1) * rows() * columns());

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

	Window($$anchor, {
		title: 'Matcaps',
		get width() {
			return $$props.windowWidth;
		},

		get height() {
			return $$props.windowHeight;
		},

		children: ($$anchor, $$slotProps) => {
			Box($$anchor, {
				class: 'h-full w-full flex-col items-stretch gap-10 p-10',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => new Array(rows()), $.index, ($$anchor, _, rowIndex) => {
						Box($$anchor, {
							class: 'h-auto w-full flex-1 items-center justify-evenly gap-10',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_1 = $.first_child(fragment_4);

								$.each(node_1, 17, () => new Array(columns()), $.index, ($$anchor, _, columnIndex, $$array) => {
									const index = $.derived(() => rowIndex * columns() + columnIndex);

									{
										const children = ($$anchor, $$arg0) => {
											let width = () => ($$arg0?.()).width;
											let height = () => ($$arg0?.()).height;

											{
												let $0 = $.derived(() => $.get(offset) + $.get(index));

												Matcap($$anchor, {
													get width() {
														return width();
													},

													get height() {
														return height();
													},

													get matcapIndex() {
														return $.get($0);
													},

													get gridIndex() {
														return $.get(index);
													},

													get format() {
														return $$props.size;
													}
												});
											}
										};

										Box($$anchor, {
											class: 'h-full w-full flex-1',
											children,
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node, 2);

					Box(node_2, {
						order: 999,
						class: 'h-40 w-auto items-center justify-center gap-10',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_3 = $.first_child(fragment_7);

							Button(node_3, {
								class: 'h-full w-auto flex-1',
								z: 15,
								text: '← PREVIOUS PAGE',
								order: 0,
								onClick: () => {
									$.set(page, Math.max(1, $.get(page) - 1), true);
								}
							});

							var node_4 = $.sibling(node_3, 2);

							Box(node_4, {
								class: 'h-full w-auto flex-1',
								order: 1,
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => `PAGE: ${$.get(page)}`);

										Label($$anchor, {
											z: 10.1,
											fontSize: 'xl',
											get text() {
												return $.get($0);
											}
										});
									}
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Button(node_5, {
								class: 'h-full w-auto flex-1',
								z: 15,
								text: 'NEXT PAGE →',
								order: 2,
								onClick: () => {
									$.set(page, Math.min(10, $.get(page) + 1), true);
								}
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}