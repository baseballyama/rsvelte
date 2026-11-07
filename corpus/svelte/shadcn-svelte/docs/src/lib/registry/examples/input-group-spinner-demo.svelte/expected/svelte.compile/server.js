import * as $ from 'svelte/internal/server';
import LoaderIcon from "@lucide/svelte/icons/loader";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Input_group_spinner_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			'data-disabled': true,
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Searching...', disabled: true });
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
							Spinner($$renderer, {});
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
			'data-disabled': true,
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Processing...', disabled: true });
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
							Spinner($$renderer, {});
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
			'data-disabled': true,
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Saving changes...', disabled: true });
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
							if (InputGroup.Text) {
								$$renderer.push('<!--[-->');

								InputGroup.Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Saving...`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);
							Spinner($$renderer, {});
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

	$$renderer.push(` `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			'data-disabled': true,
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Refreshing data...', disabled: true });
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
							LoaderIcon($$renderer, { class: 'animate-spin' });
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
							if (InputGroup.Text) {
								$$renderer.push('<!--[-->');

								InputGroup.Text($$renderer, {
									class: 'text-muted-foreground',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Please wait...`);
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

	$$renderer.push(`</div>`);
}