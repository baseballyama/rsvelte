import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Native_select_with_groups($$renderer) {
	Example($$renderer, {
		title: 'With Groups',
		children: ($$renderer) => {
			if (NativeSelect.Root) {
				$$renderer.push('<!--[-->');

				NativeSelect.Root($$renderer, {
					children: ($$renderer) => {
						if (NativeSelect.Option) {
							$$renderer.push('<!--[-->');

							NativeSelect.Option($$renderer, {
								value: '',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select a food`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (NativeSelect.OptGroup) {
							$$renderer.push('<!--[-->');

							NativeSelect.OptGroup($$renderer, {
								label: 'Fruits',
								children: ($$renderer) => {
									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'apple',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Apple`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'banana',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Banana`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'blueberry',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Blueberry`);
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

						$$renderer.push(` `);

						if (NativeSelect.OptGroup) {
							$$renderer.push('<!--[-->');

							NativeSelect.OptGroup($$renderer, {
								label: 'Vegetables',
								children: ($$renderer) => {
									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'carrot',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Carrot`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'broccoli',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Broccoli`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: 'spinach',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Spinach`);
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
}