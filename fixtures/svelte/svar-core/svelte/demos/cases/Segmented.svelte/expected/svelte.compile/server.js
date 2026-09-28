import * as $ from 'svelte/internal/server';
import { Segmented } from "../../src/index";

export default function Segmented_1($$renderer) {
	const options = [
		{
			id: 1,
			label: "One",
			icon: "wxi-view-sequential",
			title: "Grid mode"
		},

		{
			id: 2,
			label: "Two",
			icon: "wxi-view-grid",
			title: "Tiles mode"
		},

		{
			id: 3,
			label: "Three",
			icon: "wxi-view-column",
			title: "Two panels mode"
		}
	];

	const optionsIcons = options.map((a) => ({ ...a, label: null }));
	const optionsText = options.map((a) => ({ ...a, icon: null }));
	let value = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Default templates</h3> <h4>Segmented Button</h4> `);

		Segmented($$renderer, {
			options: optionsText,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <h4>Segmented Button with icons</h4> `);

		Segmented($$renderer, {
			options: optionsIcons,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <h4>Segmented Button with a mixed content</h4> `);
		Segmented($$renderer, { options, value: 1 });
		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Custom templates</h3> <h4>Segmented Button</h4> `);
		Segmented($$renderer, { options, value });
		$$renderer.push(`<!----> <h4>Segmented Button with icons</h4> `);

		{
			function children($$renderer, { option }) {
				$$renderer.push(`<i${$.attr_class(`icon ${$.stringify(option.icon)}`, 'svelte-1i607ph')}></i>`);
			}

			Segmented($$renderer, { options, value: 1, children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> <h4>Segmented Button with a mixed content</h4> `);

		{
			function children($$renderer, { option }) {
				$$renderer.push(`<i${$.attr_class(`icon ${$.stringify(option.icon)}`, 'svelte-1i607ph')}></i> <span class="bottom svelte-1i607ph">${$.escape(option.label)}</span>`);
			}

			Segmented($$renderer, { options, value: 2, children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}