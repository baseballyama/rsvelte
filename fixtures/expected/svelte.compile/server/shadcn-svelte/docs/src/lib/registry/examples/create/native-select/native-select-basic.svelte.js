import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Native_select_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
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
									$$renderer.push(`<!---->Select a fruit`);
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

						$$renderer.push(` `);

						if (NativeSelect.Option) {
							$$renderer.push('<!--[-->');

							NativeSelect.Option($$renderer, {
								value: 'grapes',
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Grapes`);
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
								value: 'pineapple',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Pineapple`);
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