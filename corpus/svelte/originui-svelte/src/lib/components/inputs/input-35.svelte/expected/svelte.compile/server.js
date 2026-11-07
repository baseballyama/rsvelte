import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

export default function Input_35($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const maxLength = 8;
		const characterLimit = useCharacterLimit(maxLength);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Input with characters left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: uid,
				type: 'text',
				maxlength: characterLimit.maxLength,
				'aria-describedby': uid,
				get value() {
					return characterLimit.value;
				},

				set value($$value) {
					characterLimit.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p${$.attr('id', uid)} class="text-muted-foreground mt-2 text-xs" role="status" aria-live="polite"><span class="tabular-nums">${$.escape(characterLimit.maxLength - characterLimit.characterCount)}</span> characters
		left</p></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}