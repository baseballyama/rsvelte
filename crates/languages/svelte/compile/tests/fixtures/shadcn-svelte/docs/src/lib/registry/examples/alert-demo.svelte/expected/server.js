import * as $ from 'svelte/internal/server';
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import PopcornIcon from "@lucide/svelte/icons/popcorn";
import * as Alert from "$lib/registry/ui/alert/index.js";

export default function Alert_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-xl items-start gap-4">`);

	if (Alert.Root) {
		$$renderer.push('<!--[-->');

		Alert.Root($$renderer, {
			children: ($$renderer) => {
				CheckCircle2Icon($$renderer, {});
				$$renderer.push(`<!----> `);

				if (Alert.Title) {
					$$renderer.push('<!--[-->');

					Alert.Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Success! Your changes have been saved`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Alert.Description) {
					$$renderer.push('<!--[-->');

					Alert.Description($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is an alert with icon, title and description.`);
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

	if (Alert.Root) {
		$$renderer.push('<!--[-->');

		Alert.Root($$renderer, {
			children: ($$renderer) => {
				PopcornIcon($$renderer, {});
				$$renderer.push(`<!----> `);

				if (Alert.Title) {
					$$renderer.push('<!--[-->');

					Alert.Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This Alert has a title and an icon. No description.`);
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

	if (Alert.Root) {
		$$renderer.push('<!--[-->');

		Alert.Root($$renderer, {
			variant: 'destructive',
			children: ($$renderer) => {
				AlertCircleIcon($$renderer, {});
				$$renderer.push(`<!----> `);

				if (Alert.Title) {
					$$renderer.push('<!--[-->');

					Alert.Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Unable to process your payment.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Alert.Description) {
					$$renderer.push('<!--[-->');

					Alert.Description($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<p>Please verify your billing information and try again.</p> <ul class="list-inside list-disc text-sm"><li>Check your card details</li> <li>Ensure sufficient funds</li> <li>Verify billing address</li></ul>`);
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