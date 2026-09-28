import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Radio_group_disabled($$renderer) {
	Example($$renderer, {
		title: 'Disabled',
		children: ($$renderer) => {
			if (RadioGroup.Root) {
				$$renderer.push('<!--[-->');

				RadioGroup.Root($$renderer, {
					value: 'option2',
					disabled: true,
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (RadioGroup.Item) {
										$$renderer.push('<!--[-->');
										RadioGroup.Item($$renderer, { value: 'option1', id: 'disabled-1' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'disabled-1',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Option 1`);
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
										RadioGroup.Item($$renderer, { value: 'option2', id: 'disabled-2' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'disabled-2',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Option 2`);
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
										RadioGroup.Item($$renderer, { value: 'option3', id: 'disabled-3' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'disabled-3',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Option 3`);
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