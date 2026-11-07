import * as $ from 'svelte/internal/server';
import List, { Item, Graphic, Meta, Text, PrimaryText, SecondaryText } from '@smui/list';
import Button, { Label } from '@smui/button';

export default function _TwoLineSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let list;

		let options = [
			{ name: 'Bruce Willis', description: 'Actor', disabled: false },
			{
				name: 'Austin Powers',
				description: 'Fictional Character',
				disabled: true
			},

			{
				name: 'Thomas Edison',
				description: 'Inventor',
				disabled: false
			},

			{
				name: 'Stephen Hawking',
				description: 'Scientist',
				disabled: false
			}
		];

		let selectionIndex = 3;

		$$renderer.push(`<div class="svelte-17y8g90">`);

		List($$renderer, {
			class: 'demo-list',
			twoLine: true,
			avatarList: true,
			singleSelection: true,
			selectedIndex: selectionIndex,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(options);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let item = each_array[i];

					Item($$renderer, {
						onSMUIAction: () => selectionIndex = i,
						disabled: item.disabled,
						selected: selectionIndex === i,
						children: ($$renderer) => {
							Graphic($$renderer, {
								style: `background-image: url(https://placehold.co/40x40?text=${$.stringify(item.name.split(' ').map((val) => val.substring(0, 1)).join(''))});`
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								children: ($$renderer) => {
									PrimaryText($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.name)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									SecondaryText($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.description)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Meta($$renderer, {
								class: 'material-icons',
								children: ($$renderer) => {
									$$renderer.push(`<!---->info`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status svelte-17y8g90">Selected: ${$.escape(selectionIndex)} - ${$.escape(options[selectionIndex].name)}</pre> <div style="margin-top: 1em;" class="svelte-17y8g90"><div class="svelte-17y8g90">Programmatically select:</div> <!--[-->`);

		const each_array_1 = $.ensure_array_like(options);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let option = each_array_1[i];

			Button($$renderer, {
				onclick: () => selectionIndex = i,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(option.name)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <div style="margin-top: 1em;" class="svelte-17y8g90"><div class="svelte-17y8g90">Programmatically focus:</div> <!--[-->`);

		const each_array_2 = $.ensure_array_like(options);

		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let option = each_array_2[i];

			Button($$renderer, {
				onclick: () => list.focusItemAtIndex(i),
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(option.name)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	});
}