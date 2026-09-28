import * as $ from 'svelte/internal/server';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

export default function Native_select_demo($$renderer) {
	if (NativeSelect.Root) {
		$$renderer.push('<!--[-->');

		NativeSelect.Root($$renderer, {
			children: ($$renderer) => {
				if (NativeSelect.Option) {
					$$renderer.push('<!--[-->');

					NativeSelect.Option($$renderer, {
						value: '',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select status`);
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
						value: 'todo',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Todo`);
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
						value: 'in-progress',
						children: ($$renderer) => {
							$$renderer.push(`<!---->In Progress`);
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
						value: 'done',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Done`);
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
						value: 'cancelled',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Cancelled`);
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