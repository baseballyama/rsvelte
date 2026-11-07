import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';

var root = $.from_html(`<div><p> </p> <button type="button" class="c-btn c-btn--icon"><i class="i i-[x] h-6 w-6"></i> <span class="sr-only">Dismiss</span></button> <div></div></div>`);

export default function Notification($$anchor, $$props) {
	$.push($$props, true);

	let content = $.prop($$props, 'content', 3, 'Placeholder'),
		special = $.prop($$props, 'special', 3, false);

	// injected by @svelte-put/async-stack
	function dismiss() {
		$$props.item.resolve({ reason: 'popped from within component' });
	}

	var div = root();
	let classes;
	var p = $.child(div);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	var div_1 = $.sibling(button, 2);
	let classes_1;

	$.set_attribute(div_1, 'aria-disabled', true);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'not-prose pointer-events-auto relative flex items-start justify-between px-4 py-2 shadow-lg md:items-center', null, classes, { 'hl-error': special(), 'hl-info': !special() });
		$.set_text(text, `Notification (variant: ${$$props.item.config.variant ?? ''}): ${content() ?? ''} (id = ${$$props.item.config.id ?? ''})`);
		classes_1 = $.set_class(div_1, 1, `progress absolute inset-x-0 bottom-0 h-0.5 origin-left ${special() ? 'bg-error-bg-200' : 'bg-info-bg-200'}`, 'svelte-r8lj3d', classes_1, { paused: $$props.item.state === 'paused' });
		$.set_style(div_1, `--progress-duration: ${$$props.item.config.timeout}ms;`);
	});

	$.event('mouseenter', div, function (...$$args) {
		$$props.item.pause?.apply(this, $$args);
	});

	$.event('mouseleave', div, function (...$$args) {
		$$props.item.resume?.apply(this, $$args);
	});

	$.delegated('click', button, dismiss);
	$.transition(5, div, () => fly, () => ({ duration: 200, y: -20 }));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);