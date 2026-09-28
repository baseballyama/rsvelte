import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';
import { Text } from '@smui/list';
import Button, { Label } from '@smui/button';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Textfield from '@smui/textfield';

export default function _AddEntries($$renderer) {
	let dialogOpen = false;

	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = [
		{ id: 0, label: 'One' },
		{ id: 1, label: 'Two' },
		{ id: 2, label: 'Three' },
		{ id: 3, label: 'Four' },
		{ id: 4, label: 'Five' }
	];

	let newLabel = '';
	let value = void 0;
	let text = '';

	function addObject() {
		const newObject = { id: options[options.length - 1].id + 1, label: newLabel };

		options = [...options, newObject];
		value = newObject;
		dialogOpen = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function noMatches($$renderer) {
				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add item`);
					},
					$$slots: { default: true }
				});
			}

			Autocomplete($$renderer, {
				options,
				getOptionLabel: (option) => option ? `${option.label} (${option.id})` : '',
				noMatchesActionDisabled: false,
				onSMUIAutocompleteNoMatchesAction: () => {
					newLabel = text;
					dialogOpen = true;
				},
				label: 'Dialog',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				get text() {
					return text;
				},

				set text($$value) {
					text = $$value;
					$$settled = false;
				},
				noMatches,
				$$slots: { noMatches: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(value ? JSON.stringify(value) : '')}</pre> `);

		Dialog($$renderer, {
			'aria-labelledby': 'autocomplete-dialog-title',
			'aria-describedby': 'autocomplete-dialog-content',
			get open() {
				return dialogOpen;
			},

			set open($$value) {
				dialogOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'autocomplete-dialog-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->New Item`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'autocomplete-dialog-content',
					children: ($$renderer) => {
						Textfield($$renderer, {
							label: 'Label',
							get value() {
								return newLabel;
							},

							set value($$value) {
								newLabel = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: addObject,
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Add`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}