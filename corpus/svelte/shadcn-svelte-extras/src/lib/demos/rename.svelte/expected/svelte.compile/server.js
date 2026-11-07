import * as $ from 'svelte/internal/server';
import * as Rename from '$lib/components/ui/rename';
import { toast } from 'svelte-sonner';

export default function Rename_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 'chore: bump deps';
		let mode = 'view';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-2"><div class="flex w-[300px] flex-col gap-2 sm:flex-row sm:place-items-center sm:justify-between">`);

			if (Rename.Provider) {
				$$renderer.push('<!--[-->');

				Rename.Provider($$renderer, {
					children: ($$renderer) => {
						if (Rename.Root) {
							$$renderer.push('<!--[-->');

							Rename.Root($$renderer, {
								this: 'span',
								validate: (value) => value.length > 0,
								class: 'w-[175px] text-xl',
								onSave: (value) => {
									toast.success(`Saved ${value}`);

									return true;
								},

								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								},

								get mode() {
									return mode;
								},

								set mode($$value) {
									mode = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="flex place-items-center gap-2">`);

						if (mode === 'edit') {
							$$renderer.push('<!--[0-->');

							if (Rename.Save) {
								$$renderer.push('<!--[-->');
								Rename.Save($$renderer, { size: 'sm' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Rename.Cancel) {
								$$renderer.push('<!--[-->');
								Rename.Cancel($$renderer, { size: 'sm' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');

							if (Rename.Edit) {
								$$renderer.push('<!--[-->');
								Rename.Edit($$renderer, { size: 'sm' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <p>Value: <span class="font-bold">${$.escape(value)}</span></p></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}