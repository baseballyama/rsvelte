import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "bits-ui";
import LockKeyOpen from "phosphor-svelte/lib/LockKeyOpen";

var root = $.from_html(`<div class="min-h-input rounded-card-sm border-border bg-background-alt shadow-mini flex h-full w-[176px] items-center gap-2 border py-1 pl-[18px] pr-1.5"><div> </div> <!></div>`);

export default function Toggle_demo($$anchor) {
	let unlocked = $.state(false);
	const code = $.derived(() => $.get(unlocked) ? "B1T5" : "••••");
	var div = root();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var node = $.sibling(div_1, 2);

	$.component(node, () => Toggle.Root, ($$anchor, Toggle_Root) => {
		Toggle_Root($$anchor, {
			'aria-label': 'toggle code visibility',
			class: 'bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center rounded-[9px] transition-all active:scale-[0.98]',
			get pressed() {
				return $.get(unlocked);
			},

			set pressed($$value) {
				$.set(unlocked, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				LockKeyOpen($$anchor, { class: 'size-6' });
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_1, 1, `font-alt text-end text-[19px] tracking-[13.87px] ${$.get(unlocked) ? 'text-foreground' : 'text-muted-foreground'}`);
		$.set_text(text, $.get(code));
	});

	$.append($$anchor, div);
}