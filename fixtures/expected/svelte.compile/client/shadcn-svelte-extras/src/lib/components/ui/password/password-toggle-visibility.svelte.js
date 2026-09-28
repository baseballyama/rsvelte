import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from '$lib/components/ui/toggle';
import EyeIcon from '@lucide/svelte/icons/eye';
import EyeOffIcon from '@lucide/svelte/icons/eye-off';
import { usePasswordToggleVisibility } from './password.svelte.js';
import { cn } from '$lib/utils.js';

export default function Password_toggle_visibility($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null);
	const state = usePasswordToggleVisibility();

	{
		let $0 = $.derived(() => state.root.opts.hidden.current ? 'Show password' : 'Hide password');
		let $1 = $.derived(() => cn('data-[state=off]:text-muted-foreground data-[state=on]:text-muted-foreground hover:data-[state=off]:text-accent-foreground hover:data-[state=on]:text-accent-foreground absolute top-1/2 right-0 size-9 min-w-0 -translate-y-1/2 p-0 hover:!bg-transparent data-[state=on]:bg-transparent', { 'right-9 max-w-6': state.root.passwordState.copyMounted }, $$props.class));

		Toggle($$anchor, {
			get 'aria-label'() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},
			tabindex: -1,
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			get pressed() {
				return state.root.opts.hidden.current;
			},

			set pressed($$value) {
				state.root.opts.hidden.current = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						EyeIcon($$anchor, { class: 'size-4' });
					};

					var alternate = ($$anchor) => {
						EyeOffIcon($$anchor, { class: 'size-4' });
					};

					$.if(node, ($$render) => {
						if (state.root.opts.hidden.current) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}