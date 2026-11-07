import * as $ from 'svelte/internal/server';
import { Button, Modal, Portal, UserAvatar } from "carbon-components-svelte";

export default function UserAvatarModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Portal($$renderer, {
			children: ($$renderer) => {
				Modal($$renderer, {
					size: 'sm',
					modalHeading: 'UserAvatar in modal',
					primaryButtonText: 'Done',
					secondaryButtonText: 'Cancel',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						UserAvatar($$renderer, {
							name: 'Richard Hendricks',
							tooltipText: 'Richard Hendricks',
							direction: 'bottom'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}