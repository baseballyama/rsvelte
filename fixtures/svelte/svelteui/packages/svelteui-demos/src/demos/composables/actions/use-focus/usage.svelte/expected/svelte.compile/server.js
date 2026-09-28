import * as $ from 'svelte/internal/server';
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

export default function Usage($$renderer) {
	let name = 'world';
	let editing = false;

	function toggleEdit() {
		editing = !editing;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			align: 'center',
			children: ($$renderer) => {
				$$renderer.push(`<p>Name: ${$.escape(name)}</p> `);

				if (editing) {
					$$renderer.push('<!--[0-->');

					InputWrapper($$renderer, {
						label: 'Name',
						children: ($$renderer) => {
							Input($$renderer, {
								use: [[focus]],
								get value() {
									return name;
								},

								set value($$value) {
									name = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(editing ? 'Confirm' : 'Edit')}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}