import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack } from '@svelteuidev/core';
import { longpress } from '@svelteuidev/composables';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
    import { longpress } from '@svelteuidev/composables';

    let pressed = false;
	let duration = 2000;
<\/script>

<div>
    <input type=range bind:value={duration} max={2000} step={100} />
    {duration}ms
</div>

<Button 
    use={[[longpress, duration]]}
    on:longpress="{() => pressed = true}"
    on:mouseenter="{() => pressed = false}"
>
    press and hold
</Button>

{#if pressed}
    <p>congratulations, you pressed and held for {duration} ms</p>
{/if}`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div><input type="range"/> </div> <!> <!>`, 1);

export default function Usage($$anchor) {
	let pressed = false;
	let duration = 2000;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var input = $.child(div);

			$.remove_input_defaults(input);
			$.set_attribute(input, 'max', 2000);
			$.set_attribute(input, 'step', 100);

			var text = $.sibling(input);

			$.reset(div);

			var node = $.sibling(div, 2);

			{
				let $0 = $.derived(() => [[longpress, duration]]);

				Button(node, {
					get use() {
						return $.get($0);
					},

					$$events: {
						longpress: () => pressed = true,
						mouseenter: () => pressed = false
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Press and hold');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var text_2 = $.only_child(p);

					$.template_effect(() => $.set_text(text_2, `Congratulations, you pressed and held for ${duration ?? ''} ms`));
					$.append($$anchor, p);
				};

				$.if(node_1, ($$render) => {
					if (pressed) $$render(consequent);
				});
			}

			$.template_effect(() => $.set_text(text, ` ${duration ?? ''}ms`));
			$.bind_value(input, () => duration, ($$value) => duration = $$value);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}