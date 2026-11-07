import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

export default function Input_34($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const maxLength = 50;
		const characterLimit = useCharacterLimit(maxLength);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Input with character limit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative">`);

			Input($$renderer, {
				id: uid,
				class: 'peer pe-14',
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

			$$renderer.push(`<!----> <div class="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50" aria-live="polite" role="status">${$.escape(characterLimit.characterCount)}/${$.escape(characterLimit.maxLength)}</div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}