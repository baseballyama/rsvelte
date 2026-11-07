import * as $ from 'svelte/internal/server';
import { Toggle } from "bits-ui";
import LockKeyOpen from "phosphor-svelte/lib/LockKeyOpen";

export default function Toggle_demo($$renderer) {
	let unlocked = false;
	const code = $.derived(() => unlocked ? "B1T5" : "••••");
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="min-h-input rounded-card-sm border-border bg-background-alt shadow-mini flex h-full w-[176px] items-center gap-2 border py-1 pl-[18px] pr-1.5"><div${$.attr_class(`font-alt text-end text-[19px] tracking-[13.87px] ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`)}>${$.escape(code())}</div> `);

		if (Toggle.Root) {
			$$renderer.push('<!--[-->');

			Toggle.Root($$renderer, {
				'aria-label': 'toggle code visibility',
				class: 'bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center rounded-[9px] transition-all active:scale-[0.98]',
				get pressed() {
					return unlocked;
				},

				set pressed($$value) {
					unlocked = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					LockKeyOpen($$renderer, { class: 'size-6' });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}