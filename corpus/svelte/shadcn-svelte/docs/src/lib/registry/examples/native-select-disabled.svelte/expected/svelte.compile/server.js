import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

export default function Native_select_disabled($$renderer) {
	if (NativeSelect.Root) {
		$$renderer.push('<!--[-->');

		NativeSelect.Root($$renderer, {
			disabled: true,
			children: ($$renderer) => {
				if (NativeSelect.Option) {
					$$renderer.push('<!--[-->');

					NativeSelect.Option($$renderer, {
						value: '',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select priority`);
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
						value: 'low',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Low`);
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
						value: 'medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Medium`);
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
						value: 'high',
						children: ($$renderer) => {
							$$renderer.push(`<!---->High`);
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
						value: 'critical',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Critical`);
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