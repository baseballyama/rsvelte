import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SkullIcon from '@lucide/svelte/icons/skull';
import { Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="grid grid-cols-2 gap-4"><div><!></div> <div></div> <button> </button></div>`);

export default function Default($$anchor) {
	let disabled = $.state(true);
	let target = $.state(void 0);
	const cardClasses = 'card preset-outlined-surface-300-700 size-24 grid place-items-center p-4';
	const buttonClasses = 'col-span-2 btn preset-filled';
	var div = root();
	var div_1 = $.child(div);

	$.set_class(div_1, 1, $.clsx(cardClasses));

	var node = $.child(div_1);

	Portal(node, {
		get disabled() {
			return $.get(disabled);
		},

		get target() {
			return $.get(target);
		},

		children: ($$anchor, $$slotProps) => {
			SkullIcon($$anchor, { class: 'size-8' });
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.set_class(div_2, 1, $.clsx(cardClasses));
	$.bind_this(div_2, ($$value) => $.set(target, $$value), () => $.get(target));

	var button = $.sibling(div_2, 2);

	$.set_class(button, 1, $.clsx(buttonClasses));

	var text = $.only_child(button, true);

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(disabled) ? 'Enable' : 'Disable'));
	$.delegated('click', button, () => $.set(disabled, !$.get(disabled)));
	$.append($$anchor, div);
}

$.delegate(['click']);