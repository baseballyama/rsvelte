import * as $ from 'svelte/internal/server';
import { ToggleGroup } from "bits-ui";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";

export default function Toggle_group_demo($$renderer) {
	let value = ["bold"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (ToggleGroup.Root) {
			$$renderer.push('<!--[-->');

			ToggleGroup.Root($$renderer, {
				type: 'multiple',
				class: 'h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (ToggleGroup.Item) {
						$$renderer.push('<!--[-->');

						ToggleGroup.Item($$renderer, {
							'aria-label': 'toggle bold',
							value: 'bold',
							class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
							children: ($$renderer) => {
								TextB($$renderer, { class: 'size-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ToggleGroup.Item) {
						$$renderer.push('<!--[-->');

						ToggleGroup.Item($$renderer, {
							'aria-label': 'toggle italic',
							value: 'italic',
							class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
							children: ($$renderer) => {
								TextItalic($$renderer, { class: 'size-6' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ToggleGroup.Item) {
						$$renderer.push('<!--[-->');

						ToggleGroup.Item($$renderer, {
							'aria-label': 'toggle strikethrough',
							value: 'strikethrough',
							class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
							children: ($$renderer) => {
								TextStrikethrough($$renderer, { class: 'size-6' });
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