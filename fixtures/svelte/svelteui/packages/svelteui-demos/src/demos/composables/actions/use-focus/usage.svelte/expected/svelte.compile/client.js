import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Input, InputWrapper, Stack } from '@svelteuidev/core';
import { focus } from '@svelteuidev/composables';

const code = `
<script>
    import { Button, Input, InputWrapper } from '@svelteuidev/core';
    import { focus } from '@svelteuidev/composables';

    let name = 'world';
    let editing = false;
    function toggleEdit() {
        editing = !editing;
    }
<\/script>

<p>Name: {name}</p>
{#if editing}
    <InputWrapper label='Name'>
        <Input use={[[focus]]} bind:value={name} />
    </InputWrapper>
{/if}
<Button on:click={toggleEdit}>{editing ? 'Confirm' : 'Edit'}</Button>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<p> </p> <!> <!>`, 1);

export default function Usage($$anchor) {
	let name = 'world';
	let editing = false;

	function toggleEdit() {
		editing = !editing;
	}

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p);
			var node = $.sibling(p, 2);

			{
				var consequent = ($$anchor) => {
					InputWrapper($$anchor, {
						label: 'Name',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => [[focus]]);

								Input($$anchor, {
									get use() {
										return $.get($0);
									},

									get value() {
										return name;
									},

									set value($$value) {
										name = $$value;
									}
								});
							}
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if (editing) $$render(consequent);
				});
			}

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				$$events: { click: toggleEdit },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, editing ? 'Confirm' : 'Edit'));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, `Name: ${name ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}