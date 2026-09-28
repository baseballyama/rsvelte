import * as $ from 'svelte/internal/server';
import { Toggle } from '$lib/components/ui/toggle';
import EyeIcon from '@lucide/svelte/icons/eye';
import EyeOffIcon from '@lucide/svelte/icons/eye-off';
import { usePasswordToggleVisibility } from './password.svelte.js';
import { cn } from '$lib/utils.js';

export default function Password_toggle_visibility($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className } = $$props;
		const state = usePasswordToggleVisibility();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Toggle($$renderer, {
				'aria-label': state.root.opts.hidden.current ? 'Show password' : 'Hide password',
				class: cn('data-[state=off]:text-muted-foreground data-[state=on]:text-muted-foreground hover:data-[state=off]:text-accent-foreground hover:data-[state=on]:text-accent-foreground absolute top-1/2 right-0 size-9 min-w-0 -translate-y-1/2 p-0 hover:!bg-transparent data-[state=on]:bg-transparent', { 'right-9 max-w-6': state.root.passwordState.copyMounted }, className),
				tabindex: -1,
				get ref() {
					return ref;
				},

				set ref($$value) {
					ref = $$value;
					$$settled = false;
				},

				get pressed() {
					return state.root.opts.hidden.current;
				},

				set pressed($$value) {
					state.root.opts.hidden.current = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (state.root.opts.hidden.current) {
						$$renderer.push('<!--[0-->');
						EyeIcon($$renderer, { class: 'size-4' });
					} else {
						$$renderer.push('<!--[-1-->');
						EyeOffIcon($$renderer, { class: 'size-4' });
					}

					$$renderer.push(`<!--]-->`);
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
		$.bind_props($$props, { ref });
	});
}