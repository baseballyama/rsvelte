import * as $ from 'svelte/internal/server';
import { Label, RadioGroup } from "bits-ui";

export default function Radio_group_demo_disabled($$renderer) {
	if (RadioGroup.Root) {
		$$renderer.push('<!--[-->');

		RadioGroup.Root($$renderer, {
			value: 'average',
			disabled: true,
			class: 'flex flex-col gap-4 text-sm font-medium opacity-50',
			children: ($$renderer) => {
				$$renderer.push(`<div class="text-foreground group flex select-none items-center transition-all">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');

					RadioGroup.Item($$renderer, {
						id: 'disabled-amazing',
						value: 'amazing',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 data-disabled:pointer-events-none size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Label.Root) {
					$$renderer.push('<!--[-->');

					Label.Root($$renderer, {
						for: 'disabled-amazing',
						class: 'pl-3',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Amazing`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="text-foreground group flex select-none items-center transition-all">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');

					RadioGroup.Item($$renderer, {
						id: 'disabled-average',
						value: 'average',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 data-disabled:pointer-events-none size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Label.Root) {
					$$renderer.push('<!--[-->');

					Label.Root($$renderer, {
						for: 'disabled-average',
						class: 'pl-3',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Average`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="text-foreground group flex select-none items-center transition-all">`);

				if (RadioGroup.Item) {
					$$renderer.push('<!--[-->');

					RadioGroup.Item($$renderer, {
						id: 'disabled-terrible',
						value: 'terrible',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 data-disabled:pointer-events-none size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Label.Root) {
					$$renderer.push('<!--[-->');

					Label.Root($$renderer, {
						for: 'disabled-terrible',
						class: 'pl-3',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Terrible`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}