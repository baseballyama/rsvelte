import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

export default function Native_select_invalid($$renderer) {
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
							$$renderer.push(`<!---->Select role`);
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
						value: 'admin',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Admin`);
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
						value: 'editor',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Editor`);
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
						value: 'viewer',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Viewer`);
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
						value: 'guest',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Guest`);
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