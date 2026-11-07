import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { Button } from '$lib/components/ui/button';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { focusManager } from '$lib/focus.svelte';

export default function ActionMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let open = false;
		const scopeId = `action-menu-${crypto.randomUUID()}`;

		function handleKeydown(e) {
			if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										size: 'action',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Actions `);
											KeyboardShortcut($$renderer, { shortcut: { key: 'k', modifiers: ['cmd'] } });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									'data-testid': 'action-menu-trigger',
									child,
									$$slots: { child: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'w-80',
								children: ($$renderer) => {
									children($$renderer);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}