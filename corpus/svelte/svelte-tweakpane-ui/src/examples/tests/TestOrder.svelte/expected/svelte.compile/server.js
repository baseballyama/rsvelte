import * as $ from 'svelte/internal/server';
import { AutoValue, ButtonGrid, Checkbox, Pane, Separator, Slider } from '$lib';
import Button from '$lib/control/Button.svelte';
import Folder from '$lib/core/Folder.svelte';

export default function TestOrder($$renderer) {
	const testObject = {
		someColor: { r: 255, g: 0, b: 55 },
		someOtherColor: { r: 0, g: 255, b: 55 }
	};

	let showNumbers = true;
	let folderWrap = false;
	let someNumber = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			children: ($$renderer) => {
				if (folderWrap) {
					$$renderer.push('<!--[0-->');

					Folder($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(Object.keys(testObject));

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let key = each_array[$$index];

								if (typeof testObject[key] !== 'number' || showNumbers) {
									$$renderer.push('<!--[0-->');

									AutoValue($$renderer, {
										label: key,
										get value() {
											return testObject[key];
										},

										set value($$value) {
											testObject[key] = $$value;
											$$settled = false;
										}
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'Some Number',
						get value() {
							return someNumber;
						},

						set value($$value) {
							someNumber = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_1 = $.ensure_array_like(Object.keys(testObject));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let key = each_array_1[$$index_1];

						if (typeof testObject[key] !== 'number' || showNumbers) {
							$$renderer.push('<!--[0-->');

							AutoValue($$renderer, {
								label: key,
								get value() {
									return testObject[key];
								},

								set value($$value) {
									testObject[key] = $$value;
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--> `);

					Slider($$renderer, {
						label: 'Some Number',
						get value() {
							return someNumber;
						},

						set value($$value) {
							someNumber = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> `);
				ButtonGrid($$renderer, { buttons: ['Copy', 'Reset'] });
				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					expanded: false,
					title: 'Tweakpane CSS Options',
					children: ($$renderer) => {
						Checkbox($$renderer, {
							label: 'Show Numbers',
							get value() {
								return showNumbers;
							},

							set value($$value) {
								showNumbers = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'Folder Wrap',
							get value() {
								return folderWrap;
							},

							set value($$value) {
								folderWrap = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Button($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}