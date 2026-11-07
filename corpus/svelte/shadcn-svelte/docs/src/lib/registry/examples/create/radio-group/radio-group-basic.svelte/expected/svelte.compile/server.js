import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Radio_group_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			if (RadioGroup.Root) {
				$$renderer.push('<!--[-->');

				RadioGroup.Root($$renderer, {
					value: 'comfortable',
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (RadioGroup.Item) {
										$$renderer.push('<!--[-->');
										RadioGroup.Item($$renderer, { value: 'default', id: 'r1' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'r1',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Default`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (RadioGroup.Item) {
										$$renderer.push('<!--[-->');
										RadioGroup.Item($$renderer, { value: 'comfortable', id: 'r2' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'r2',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Comfortable`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (RadioGroup.Item) {
										$$renderer.push('<!--[-->');
										RadioGroup.Item($$renderer, { value: 'compact', id: 'r3' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'r3',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Compact`);
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