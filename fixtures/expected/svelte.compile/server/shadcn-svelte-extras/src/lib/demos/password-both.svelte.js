import * as $ from 'svelte/internal/server';
import * as Password from '$lib/components/ui/password';
import * as Toggle from '$lib/components/ui/toggle';

export default function Password_both($$renderer) {
	let showVisibility = true;
	let showCopy = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex w-full max-w-3xs flex-col gap-2">`);

		if (Password.Root) {
			$$renderer.push('<!--[-->');

			Password.Root($$renderer, {
				children: ($$renderer) => {
					if (Password.Input) {
						$$renderer.push('<!--[-->');

						Password.Input($$renderer, {
							value: 'thisIsASuperLongSecretPasswordThatShouldBeUsedForTestingPurposesAndIsDefinitelyLongerThanMostTypicalPasswords1234567890',
							children: ($$renderer) => {
								if (showVisibility) {
									$$renderer.push('<!--[0-->');

									if (Password.ToggleVisibility) {
										$$renderer.push('<!--[-->');
										Password.ToggleVisibility($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (showCopy) {
									$$renderer.push('<!--[0-->');

									if (Password.Copy) {
										$$renderer.push('<!--[-->');
										Password.Copy($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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

		$$renderer.push(` <div class="flex w-full place-items-center justify-center gap-2">`);

		if (Toggle.Root) {
			$$renderer.push('<!--[-->');

			Toggle.Root($$renderer, {
				get pressed() {
					return showVisibility;
				},

				set pressed($$value) {
					showVisibility = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->Show Visibility`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Toggle.Root) {
			$$renderer.push('<!--[-->');

			Toggle.Root($$renderer, {
				get pressed() {
					return showCopy;
				},

				set pressed($$value) {
					showCopy = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->Show Copy`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}