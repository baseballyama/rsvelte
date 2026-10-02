import * as $ from 'svelte/internal/server';
import * as Password from '$lib/components/ui/password';

export default function Password_copy($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-3xs flex-col gap-2">`);

	if (Password.Root) {
		$$renderer.push('<!--[-->');

		Password.Root($$renderer, {
			children: ($$renderer) => {
				if (Password.Input) {
					$$renderer.push('<!--[-->');

					Password.Input($$renderer, {
						readonly: true,
						value: 'c5xZTsVUs8HoLpBAajKGfbtG8SSbQAC6',
						children: ($$renderer) => {
							if (Password.Copy) {
								$$renderer.push('<!--[-->');
								Password.Copy($$renderer, {});
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

	$$renderer.push(`</div>`);
}