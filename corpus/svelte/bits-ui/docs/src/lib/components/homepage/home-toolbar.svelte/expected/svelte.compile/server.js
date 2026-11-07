import * as $ from 'svelte/internal/server';
import { Toolbar } from "bits-ui";
import WaveSine from "phosphor-svelte/lib/WaveSine";
import WaveSquare from "phosphor-svelte/lib/WaveSquare";
import WaveTriangle from "phosphor-svelte/lib/WaveTriangle";

export default function Home_toolbar($$renderer) {
	let wave = "sine";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Toolbar.Root) {
			$$renderer.push('<!--[-->');

			Toolbar.Root($$renderer, {
				class: 'bg-background-alt flex h-7 w-min items-center rounded-[5px] px-[3px] lg:h-10 lg:rounded-[7px] lg:px-[4px] dark:bg-white',
				children: ($$renderer) => {
					if (Toolbar.Group) {
						$$renderer.push('<!--[-->');

						Toolbar.Group($$renderer, {
							type: 'single',
							class: 'inline-flex items-center gap-x-0.5',
							get value() {
								return wave;
							},

							set value($$value) {
								wave = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'wave sine',
										value: 'sine',
										class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8  dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
										children: ($$renderer) => {
											WaveSine($$renderer, { class: 'size-[14px] lg:size-5' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'wave square',
										value: 'square',
										class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8 dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
										children: ($$renderer) => {
											WaveSquare($$renderer, { class: 'size-[14px] lg:size-5' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Toolbar.GroupItem) {
									$$renderer.push('<!--[-->');

									Toolbar.GroupItem($$renderer, {
										'aria-label': 'wave triangle',
										value: 'triangle',
										class: 'bg-background-alt text-foreground/60 hover:bg-muted data-[state=on]:bg-foreground  data-[state=on]:text-background active:data-[state=on]:bg-dark-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-[7px] transition-all active:scale-[0.98] lg:size-8 dark:bg-white dark:text-[#808080] dark:data-[state=on]:bg-[#18181B] dark:data-[state=on]:text-white',
										children: ($$renderer) => {
											WaveTriangle($$renderer, { class: 'size-[14px] lg:size-5' });
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}