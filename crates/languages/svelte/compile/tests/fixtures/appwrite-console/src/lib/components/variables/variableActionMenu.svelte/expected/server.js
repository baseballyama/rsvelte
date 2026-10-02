import * as $ from 'svelte/internal/server';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import { Icon, ActionMenu } from '@appwrite.io/pink-svelte';
import { IconDotsHorizontal, IconPencil, IconEyeOff, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { Button as PinkButton } from '@appwrite.io/pink-svelte';

export default function VariableActionMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { variable, onUpdate, onSecret, onDelete } = $$props;
		let open = false;
		let triggerEl = null;
		let menuEl = null;
		let cleanup = null;

		function hide() {
			open = false;
		}

		function toggle() {
			open = !open;
		}

		function portalToBody(node) {
			document.body.appendChild(node);

			return {
				destroy() {
					node.parentNode?.removeChild(node);
				}
			};
		}

		function handleWindowClick(e) {
			if (!open) return;

			const target = e.target;

			if (triggerEl?.contains(target) || menuEl?.contains(target)) return;

			hide();
		}

		function handleKeydown(e) {
			if (e.key === 'Escape') hide();
		}

		$$renderer.push(`<span>`);

		if (PinkButton.Button) {
			$$renderer.push('<!--[-->');

			PinkButton.Button($$renderer, {
				icon: true,
				variant: 'text',
				size: 's',
				'aria-label': 'More options',
				onclick: (e) => {
					e.preventDefault();
					toggle();
				},

				children: ($$renderer) => {
					Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</span> `);

		if (open) {
			$$renderer.push(`<!--[0--><div style="position: fixed; z-index: 9001; background: var(--bgcolor-neutral-primary); border: var(--border-width-s) solid var(--border-neutral); border-radius: var(--border-radius-m); box-shadow: 0 1px 3px 0 rgba(0,0,0,0.03), 0 4px 4px 0 rgba(0,0,0,0.04); overflow: hidden;" role="menu">`);

			if (ActionMenu.Root) {
				$$renderer.push('<!--[-->');

				ActionMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (!variable?.secret) {
							$$renderer.push('<!--[0-->');

							if (ActionMenu.Item.Button) {
								$$renderer.push('<!--[-->');

								ActionMenu.Item.Button($$renderer, {
									leadingIcon: IconPencil,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Update`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (!variable?.secret) {
							$$renderer.push('<!--[0-->');

							if (ActionMenu.Item.Button) {
								$$renderer.push('<!--[-->');

								ActionMenu.Item.Button($$renderer, {
									leadingIcon: IconEyeOff,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Secret`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (ActionMenu.Item.Button) {
							$$renderer.push('<!--[-->');

							ActionMenu.Item.Button($$renderer, {
								status: 'danger',
								leadingIcon: IconTrash,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}