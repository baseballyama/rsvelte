import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack } from '@svelteuidev/core';
import { persistenttab } from '@svelteuidev/composables';

const code = `
<script>
    import { persistenttab } from '@svelteuidev/composables';

    let isNotClosable = false;
<\/script>

<button on:click={() => isNotClosable = !isNotClosable}>
    {isNotClosable ? "Can't close tab" : 'Can close tab'}
</button>

<div use:persistenttab={isNotClosable}>
    Something important that the user wouldn't want to lose to a page refresh or close
</div>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<button> </button> <div>Something important that the user wouldn't want to lose to a page refresh or close</div>`, 1);

export default function Usage($$anchor) {
	let isNotClosable = false;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var button = $.first_child(fragment_1);
			var text = $.only_child(button, true);
			var div = $.sibling(button, 2);

			$.action(div, ($$node, $$action_arg) => persistenttab?.($$node, $$action_arg), () => isNotClosable);
			$.template_effect(() => $.set_text(text, isNotClosable ? "Can't close tab" : 'Can close tab'));
			$.event('click', button, () => isNotClosable = !isNotClosable);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}