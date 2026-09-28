import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const iconClassMap = {
	info: 'i-[info]',
	success: 'i-[check-circle]',
	warning: 'i-[warning]',
	error: 'i-[warning-circle]'
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'item',
	'title',
	'message',
	'status',
	'class'
]);

var root = $.from_html(`<article><button class="absolute right-0 top-0 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border border-current bg-inherit p-1.5"><i class="i i-[x] h-3.5 w-3.5 svelte-ogf5ng"></i> <span class="sr-only">Dismiss</span></button> <div class="relative flex items-start gap-3 overflow-hidden p-3"><div></div> <div class="leading-normal"><p class="mb-2 border-b border-current pb-1 font-medium"> </p> <p> </p></div> <div class="progress absolute inset-x-0 bottom-0 h-0.5 origin-left overflow-hidden svelte-ogf5ng" aria-disabled="true"></div></div></article>`);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	let status = $.prop($$props, 'status', 3, 'info'),
		rest = $.rest_props($$props, rest_excludes);

	const iconClass = $.derived(() => status() ? iconClassMap[status()] : 'i-[info]');

	function dismiss() {
		$$props.item.resolve();
	}

	var article = root();

	$.attribute_effect(
		article,
		() => ({
			class: `relative shadow ${$$props.class ?? ''}`,
			role: 'status',
			'aria-live': 'polite',
			'aria-atomic': 'true',
			'data-status': status(),
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-ogf5ng'
	);

	var button = $.child(article);
	var div = $.sibling(button, 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var p = $.child(div_2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	let styles;

	$.reset(div);
	$.reset(article);

	$.template_effect(() => {
		$.set_class(div_1, 1, `i ${$.get(iconClass) ?? ''} h-6 w-6 shrink-0`, 'svelte-ogf5ng');
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.message);

		styles = $.set_style(div_3, '', styles, {
			'--progress-duration': $$props.item.config.timeout + 'ms',
			'--progress-play-state': $$props.item.state === 'paused' ? 'paused' : 'running'
		});
	});

	$.delegated('click', button, dismiss);
	$.append($$anchor, article);
	$.pop();
}

$.delegate(['click']);