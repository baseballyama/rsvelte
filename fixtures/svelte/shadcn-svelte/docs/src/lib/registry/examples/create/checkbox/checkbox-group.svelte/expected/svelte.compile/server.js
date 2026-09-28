import * as $ from 'svelte/internal/server';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Checkbox_group($$renderer) {
	Example($$renderer, {
		title: 'Group',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show these items on the desktop:`);
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
									if (Checkbox.Root) {
										$$renderer.push('<!--[-->');
										Checkbox.Root($$renderer, { id: 'finder-pref-9k2-hard-disks-ljj' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'finder-pref-9k2-hard-disks-ljj',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hard disks`);
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
									if (Checkbox.Root) {
										$$renderer.push('<!--[-->');
										Checkbox.Root($$renderer, { id: 'finder-pref-9k2-external-disks-1yg' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'finder-pref-9k2-external-disks-1yg',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->External disks`);
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
									if (Checkbox.Root) {
										$$renderer.push('<!--[-->');
										Checkbox.Root($$renderer, { id: 'finder-pref-9k2-cds-dvds-fzt' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'finder-pref-9k2-cds-dvds-fzt',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->CDs, DVDs, and iPods`);
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
									if (Checkbox.Root) {
										$$renderer.push('<!--[-->');
										Checkbox.Root($$renderer, { id: 'finder-pref-9k2-connected-servers-6l2' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'finder-pref-9k2-connected-servers-6l2',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Connected servers`);
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