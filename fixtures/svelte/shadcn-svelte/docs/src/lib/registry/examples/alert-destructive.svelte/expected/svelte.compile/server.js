import * as $ from 'svelte/internal/server';
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
import * as Alert from "$lib/registry/ui/alert/index.js";

export default function Alert_destructive($$renderer) {
	if (Alert.Root) {
		$$renderer.push('<!--[-->');

		Alert.Root($$renderer, {
			variant: 'destructive',
			children: ($$renderer) => {
				CircleAlertIcon($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> `);

				if (Alert.Title) {
					$$renderer.push('<!--[-->');

					Alert.Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Error`);
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
							$$renderer.push(`<!---->Your session has expired. Please login again.`);
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