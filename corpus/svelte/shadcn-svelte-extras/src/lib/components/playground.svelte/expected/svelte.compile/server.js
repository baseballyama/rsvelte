import * as $ from 'svelte/internal/server';
import * as Tabs from '$lib/components/ui/tabs';
import * as Code from '$lib/components/ui/code';
import { cn } from '$lib/utils.js';
import { Button } from './ui/button';
import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, code, class: className = undefined, replay = false } = $$props;
		let remountCount = 0;
		let tab = 'preview';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn('border-border relative flex min-h-[400px] place-items-center justify-center rounded-lg border', className)))}>`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					class: 'size-full',
					get value() {
						return tab;
					},

					set value($$value) {
						tab = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'absolute top-3 right-3 z-10',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'preview',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Preview`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'code',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Code`);
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

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'preview',
								class: 'size-full',
								children: ($$renderer) => {
									if (replay) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											size: 'icon',
											variant: 'ghost',
											class: 'absolute top-3 left-3',
											onclick: () => remountCount++,
											children: ($$renderer) => {
												RefreshCwIcon($$renderer, { class: 'size-4' });
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <!---->`);

									{
										$$renderer.push(`<div class="flex size-full place-items-center justify-center">`);
										children($$renderer);
										$$renderer.push(`<!----></div>`);
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

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'code',
								class: 'size-full pb-4',
								children: ($$renderer) => {
									if (Code.Root) {
										$$renderer.push('<!--[-->');

										Code.Root($$renderer, {
											lang: 'svelte',
											code,
											class: 'size-full border-none bg-transparent',
											hideLines: true
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}