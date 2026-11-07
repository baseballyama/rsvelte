import * as $ from 'svelte/internal/server';
import * as Alert from '$lib/components/ui/alert';
import { Link } from '$lib/components/ui/link';
import { cn } from '$lib/utils.js';
import * as HoverCard from '$lib/components/ui/hover-card';
import InfoIcon from '@lucide/svelte/icons/info';
import { highlighter } from '$lib/components/ui/code/shiki';
import { onMount } from 'svelte';

export default function Reference_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, component } = $$props;
		let hl = void 0;

		onMount(() => {
			highlighter.then((highlighter) => hl = highlighter);
		});

		$$renderer.push(`<div class="flex flex-col gap-6"><div class="flex flex-col gap-3"><span class="bg-secondary flex w-fit place-items-center rounded-md px-2 py-1 font-mono text-lg font-light"><span>${$.escape(name)}${$.escape(component.name ? '.' : '')}</span> <h3${$.attr('id', component.name)}>${$.escape(component.name)}</h3></span> <p class="text-neutral-800 dark:text-neutral-300">${$.escape(component.description)}</p></div> `);

		if (component.forwardTo) {
			$$renderer.push('<!--[0-->');

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					children: ($$renderer) => {
						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Documentation for this component's props can be found at `);

									Link($$renderer, {
										href: component.forwardTo.href,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(component.forwardTo.name)}`);
										},
										$$slots: { default: true }
									});

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
		} else if (Object.entries(component.props).length > 0) {
			$$renderer.push(`<!--[1--><div class="border-border bg-card rounded-lg border"><table${$.attr_class($.clsx(cn('w-full', '')))}><thead><tr class="border-border border-b"><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Prop</th><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Type</th><th class="text-foreground px-4 py-2 text-left text-sm font-semibold">Default</th></tr></thead><tbody><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(component.props));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [prop, value] = each_array[$$index];
				const propValue = value;

				$$renderer.push(`<tr class="bg-card border-border not-last:border-b"><td class="text-foreground px-4 py-2 align-top"><div class="flex place-items-center gap-2"><span class="bg-brand/25 text-brand rounded-md px-2 py-1 font-mono text-sm font-light">${$.escape(prop)}${$.escape(propValue.required ? '' : '?')}</span> `);

				if (propValue.bindable) {
					$$renderer.push(`<!--[0--><span class="rounded-md bg-blue-500/50 px-2 py-1 font-mono text-xs font-light text-blue-600 dark:bg-blue-500/50 dark:text-blue-300">$bindable</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></td><td class="text-foreground flex place-items-center px-4 py-2 align-top whitespace-pre"><span class="bg-secondary text-foreground/75 rounded-md px-2 py-1 font-mono text-sm font-light">${$.escape(propValue.type)}</span> `);

				if (propValue.tooltip) {
					$$renderer.push('<!--[0-->');

					const tooltipHighlighted = hl?.codeToHtml(propValue.tooltip ?? '', {
						lang: propValue.type === 'Snippet' ? 'svelte' : 'typescript',
						themes: { light: 'github-light-default', dark: 'github-dark-default' }
					});

					if (HoverCard.Root) {
						$$renderer.push('<!--[-->');

						HoverCard.Root($$renderer, {
							openDelay: 50,
							closeDelay: 0,
							children: ($$renderer) => {
								if (HoverCard.Trigger) {
									$$renderer.push('<!--[-->');

									HoverCard.Trigger($$renderer, {
										class: 'text-muted-foreground inline-flex size-[26px] place-items-center justify-center',
										children: ($$renderer) => {
											InfoIcon($$renderer, { class: 'size-4' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (HoverCard.Content) {
									$$renderer.push('<!--[-->');

									HoverCard.Content($$renderer, {
										align: 'center',
										class: 'code-tooltip flex place-items-center justify-center p-0',
										children: ($$renderer) => {
											$$renderer.push(`${$.html(tooltipHighlighted)}`);
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></td><td class="text-muted-foreground px-4 py-2 align-top"><span class="font-mono text-sm font-light">${$.escape(propValue.defaultValue === undefined ? '-' : propValue.defaultValue)}</span></td></tr>`);
			}

			$$renderer.push(`<!--]--></tbody></table></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}