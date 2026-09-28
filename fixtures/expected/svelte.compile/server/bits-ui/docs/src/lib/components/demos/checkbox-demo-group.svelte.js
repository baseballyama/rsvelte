import * as $ from 'svelte/internal/server';
import { Checkbox, Label, useId } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";

function MyCheckbox($$renderer, { value, label }) {
	const id = useId();

	$$renderer.push(`<div class="flex items-center">`);

	{
		function children($$renderer, { checked, indeterminate }) {
			$$renderer.push(`<div class="text-background inline-flex items-center justify-center">`);

			if (indeterminate) {
				$$renderer.push('<!--[0-->');
				Minus($$renderer, { class: 'size-[15px]', weight: 'bold' });
			} else if (checked) {
				$$renderer.push('<!--[1-->');
				Check($$renderer, { class: 'size-[15px]', weight: 'bold' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		if (Checkbox.Root) {
			$$renderer.push('<!--[-->');

			Checkbox.Root($$renderer, {
				id,
				'aria-labelledby': `${$.stringify(id)}-label`,
				class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
				name: 'hello',
				value,
				children,
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(` `);

	if (Label.Root) {
		$$renderer.push('<!--[-->');

		Label.Root($$renderer, {
			id: `${$.stringify(id)}-label`,
			for: id,
			class: 'pl-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(label)}`);
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

export default function Checkbox_demo_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let myValue = ["marketing", "news"];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Checkbox.Group) {
				$$renderer.push('<!--[-->');

				Checkbox.Group($$renderer, {
					class: 'flex flex-col gap-3',
					name: 'notifications',
					onValueChange: console.log,
					get value() {
						return myValue;
					},

					set value($$value) {
						myValue = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Checkbox.GroupLabel) {
							$$renderer.push('<!--[-->');

							Checkbox.GroupLabel($$renderer, {
								class: 'text-foreground-alt text-sm font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Notifications`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="flex flex-col gap-4">`);
						MyCheckbox($$renderer, { label: "Marketing", value: "marketing" });
						$$renderer.push(`<!----> `);
						MyCheckbox($$renderer, { label: "Promotions", value: "promotions" });
						$$renderer.push(`<!----> `);
						MyCheckbox($$renderer, { label: "News", value: "news" });
						$$renderer.push(`<!----> `);
						MyCheckbox($$renderer, { label: "Updates", value: "updates" });
						$$renderer.push(`<!----></div>`);
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