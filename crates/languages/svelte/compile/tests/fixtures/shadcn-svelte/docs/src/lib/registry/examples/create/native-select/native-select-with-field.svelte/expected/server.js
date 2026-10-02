import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Native_select_with_field($$renderer) {
	Example($$renderer, {
		title: 'With Field',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'native-select-country',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Country`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (NativeSelect.Root) {
							$$renderer.push('<!--[-->');

							NativeSelect.Root($$renderer, {
								id: 'native-select-country',
								children: ($$renderer) => {
									if (NativeSelect.Option) {
										$$renderer.push('<!--[-->');

										NativeSelect.Option($$renderer, {
											value: '',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select a country`);
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
											value: 'us',
											children: ($$renderer) => {
												$$renderer.push(`<!---->United States`);
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
											value: 'uk',
											children: ($$renderer) => {
												$$renderer.push(`<!---->United Kingdom`);
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
											value: 'ca',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Canada`);
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
											value: 'au',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Australia`);
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

						if (Field.Description) {
							$$renderer.push('<!--[-->');

							Field.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select your country of residence.`);
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