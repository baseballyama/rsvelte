import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

export default function Textarea_16($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const maxLength = 180;
		const characterLimit = useCharacterLimit(maxLength);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Textarea with characters left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Textarea($$renderer, {
				id: uid,
				maxlength: characterLimit.maxLength,
				'aria-describedby': `${uid}-characters-left-textarea`,
				get value() {
					return characterLimit.value;
				},

				set value($$value) {
					characterLimit.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p${$.attr('id', `${uid}-characters-left-textarea`)} class="text-muted-foreground mt-2 text-right text-xs" role="status" aria-live="polite"><span class="tabular-nums">${$.escape(characterLimit.maxLength - characterLimit.characterCount)}</span> characters left</p></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}