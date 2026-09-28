import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Native_select_invalid($$renderer) {
	Example($$renderer, {
		title: 'Invalid',
		children: ($$renderer) => {
			if (NativeSelect.Root) {
				$$renderer.push('<!--[-->');

				NativeSelect.Root($$renderer, {
					'aria-invalid': 'true',
					children: ($$renderer) => {
						if (NativeSelect.Option) {
							$$renderer.push('<!--[-->');

							NativeSelect.Option($$renderer, {
								value: '',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Error state`);
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