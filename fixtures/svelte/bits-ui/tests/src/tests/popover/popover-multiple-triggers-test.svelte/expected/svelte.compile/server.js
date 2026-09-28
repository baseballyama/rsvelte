import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";

export default function Popover_multiple_triggers_test($$renderer) {
	if (Popover.Root) {
		$$renderer.push('<!--[-->');

		Popover.Root($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						'data-testid': 'trigger-1',
						children: ($$renderer) => {
							$$renderer.push(`<!---->trigger-1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						'data-testid': 'trigger-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->trigger-2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						'data-testid': 'trigger-3',
						children: ($$renderer) => {
							$$renderer.push(`<!---->trigger-3`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Portal) {
					$$renderer.push('<!--[-->');

					Popover.Portal($$renderer, {
						children: ($$renderer) => {
							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									'data-testid': 'content',
									children: ($$renderer) => {
										$$renderer.push(`<!---->content`);
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
}