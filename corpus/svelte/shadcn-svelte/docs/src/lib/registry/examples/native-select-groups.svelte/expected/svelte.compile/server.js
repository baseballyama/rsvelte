import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

export default function Native_select_groups($$renderer) {
	if (NativeSelect.Root) {
		$$renderer.push('<!--[-->');

		NativeSelect.Root($$renderer, {
			children: ($$renderer) => {
				if (NativeSelect.Option) {
					$$renderer.push('<!--[-->');

					NativeSelect.Option($$renderer, {
						value: '',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select department`);
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
						label: 'Engineering',
						children: ($$renderer) => {
							if (NativeSelect.Option) {
								$$renderer.push('<!--[-->');

								NativeSelect.Option($$renderer, {
									value: 'frontend',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Frontend`);
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
									value: 'backend',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Backend`);
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
									value: 'devops',
									children: ($$renderer) => {
										$$renderer.push(`<!---->DevOps`);
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
						label: 'Sales',
						children: ($$renderer) => {
							if (NativeSelect.Option) {
								$$renderer.push('<!--[-->');

								NativeSelect.Option($$renderer, {
									value: 'sales-rep',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Sales Rep`);
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
									value: 'account-manager',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Account Manager`);
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
									value: 'sales-director',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Sales Director`);
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
						label: 'Operations',
						children: ($$renderer) => {
							if (NativeSelect.Option) {
								$$renderer.push('<!--[-->');

								NativeSelect.Option($$renderer, {
									value: 'support',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Customer Support`);
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
									value: 'product-manager',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Product Manager`);
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
									value: 'ops-manager',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Operations Manager`);
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
}