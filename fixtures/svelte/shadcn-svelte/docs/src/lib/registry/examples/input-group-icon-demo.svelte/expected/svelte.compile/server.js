import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import InfoIcon from "@lucide/svelte/icons/info";
import MailIcon from "@lucide/svelte/icons/mail";
import SearchIcon from "@lucide/svelte/icons/search";
import StarIcon from "@lucide/svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

export default function Input_group_icon_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-6">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Search...' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						children: ($$renderer) => {
							SearchIcon($$renderer, {});
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

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { type: 'email', placeholder: 'Enter your email' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						children: ($$renderer) => {
							MailIcon($$renderer, {});
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

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Card number' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						children: ($$renderer) => {
							CreditCardIcon($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							CheckIcon($$renderer, {});
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

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Card number' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							StarIcon($$renderer, {});
							$$renderer.push(`<!----> `);
							InfoIcon($$renderer, {});
							$$renderer.push(`<!---->`);
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