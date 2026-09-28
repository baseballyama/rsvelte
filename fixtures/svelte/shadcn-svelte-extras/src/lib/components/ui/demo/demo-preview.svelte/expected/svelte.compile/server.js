import * as $ from 'svelte/internal/server';
import * as Resizable from '$lib/components/ui/resizable';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { useDemoPreview } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Demo_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type, demo, class: className, children } = $$props;
		let resizableRef = null;

		const previewState = useDemoPreview({
			type: box.with(() => type),
			demo: box.with(() => demo),
			resizableRef: box.with(() => resizableRef)
		});

		if (Tabs.Content) {
			$$renderer.push('<!--[-->');

			Tabs.Content($$renderer, {
				value: 'preview',
				'data-slot': 'demo-preview',
				class: cn('border-border bg-background relative flex min-h-[400px] max-w-full items-center justify-center rounded-md border', {
					'bg-accent dark:bg-card border-none [--pattern-fg:oklch(0_0_0/0.05)] before:pointer-events-none before:absolute before:inset-px before:rounded-[calc(0.625rem-1px)] before:bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] dark:[--pattern-fg:oklch(1_0_0/0.05)]': type === 'iframe',
					className
				}),

				children: ($$renderer) => {
					if (children) {
						$$renderer.push(`<!--[0--><!---->`);

						{
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');

						if (Resizable.PaneGroup) {
							$$renderer.push('<!--[-->');

							Resizable.PaneGroup($$renderer, {
								direction: 'horizontal',
								children: ($$renderer) => {
									if (Resizable.Pane) {
										$$renderer.push('<!--[-->');

										Resizable.Pane($$renderer, {
											defaultSize: 100,
											minSize: 30,
											onResize: previewState.onResize,
											class: 'border-border bg-background relative rounded-md border',
											children: ($$renderer) => {
												$$renderer.push(`<!---->`);

												{
													$$renderer.push(`<iframe${$.attr('title', `Preview ${$.stringify(demo)}`)}${$.attr('src', `/demos/${demo}`)} loading="lazy" class="relative z-20 h-full w-full"></iframe>`);
												}

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Resizable.Handle) {
										$$renderer.push('<!--[-->');

										Resizable.Handle($$renderer, {
											withHandle: true,
											class: 'z-30 bg-transparent [&_div]:absolute [&_div]:top-1/2 [&_div]:right-2 [&_div]:h-12 [&_div]:w-2 [&_div]:-translate-y-1/2 [&_div]:rounded-full [&_div]:border-none [&_div_svg]:hidden'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Resizable.Pane) {
										$$renderer.push('<!--[-->');
										Resizable.Pane($$renderer, { defaultSize: 0 });
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

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}