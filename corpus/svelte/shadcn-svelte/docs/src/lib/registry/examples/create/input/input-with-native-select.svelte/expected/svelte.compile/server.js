import * as $ from 'svelte/internal/server';
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_with_native_select($$renderer) {
	Example($$renderer, {
		title: 'With Native Select',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full gap-2">`);

			if (Input.Root) {
				$$renderer.push('<!--[-->');
				Input.Root($$renderer, { type: 'tel', placeholder: '(555) 123-4567', class: 'flex-1' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (NativeSelect.Root) {
				$$renderer.push('<!--[-->');

				NativeSelect.Root($$renderer, {
					value: '+1',
					children: ($$renderer) => {
						if (NativeSelect.Option) {
							$$renderer.push('<!--[-->');

							NativeSelect.Option($$renderer, {
								value: '+1',
								children: ($$renderer) => {
									$$renderer.push(`<!---->+1`);
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
								value: '+44',
								children: ($$renderer) => {
									$$renderer.push(`<!---->+44`);
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
								value: '+46',
								children: ($$renderer) => {
									$$renderer.push(`<!---->+46`);
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

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}