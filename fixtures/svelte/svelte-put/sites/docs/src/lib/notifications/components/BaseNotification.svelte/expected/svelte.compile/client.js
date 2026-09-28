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
	'status',
	'class',
	'children'
]);

var root = $.from_html(`<article><button class="absolute right-0 top-0 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full
		border border-current bg-inherit p-1.5"><i class="i i-[x] h-3.5 w-3.5 svelte-pgvmbk"></i> <span class="sr-only">Dismiss</span></button> <div class="rounded-inherit relative flex items-start gap-3 overflow-hidden p-3"><div></div> <div class="w-full leading-normal"><p> </p> <!></div> <div class="progress absolute inset-x-0 bottom-0 h-0.5 origin-left overflow-hidden svelte-pgvmbk" aria-disabled="true"></div></div></article>`);

export default function BaseNotification($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	function dismiss() {
		$$props.item.resolve();
	}

	const iconClass = $$props.status ? iconClassMap[$$props.status] : 'i-[info]';
	var article = root();

	$.attribute_effect(
		article,
		() => ({
			class: `relative rounded border shadow ${$$props.class ?? ''}`,
			role: 'status',
			'aria-live': 'polite',
			'aria-atomic': 'true',
			'data-status': $$props.status,
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-pgvmbk'
	);

	var button = $.child(article);
	var div = $.sibling(button, 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var p = $.child(div_2);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	let styles;

	$.reset(div);
	$.reset(article);

	$.template_effect(
		($0) => {
			$.set_class(div_1, 1, `i ${iconClass ?? ''} h-6 w-6 shrink-0`, 'svelte-pgvmbk');
			$.set_class(p, 1, `mb-2 border-b ${$$props.status ? 'border-current' : ''} pb-1 font-medium`);
			$.set_text(text, $0);

			styles = $.set_style(div_3, '', styles, {
				'--progress-duration': $$props.item.config.timeout + 'ms',
				'--progress-play-state': $$props.item.state === 'paused' ? 'paused' : 'running'
			});
		},
		[
			() => $$props.title ?? ($$props.status
				? $$props.status[0].toUpperCase() + $$props.status.slice(1)
				: '')
		]
	);

	$.delegated('click', button, dismiss);
	$.append($$anchor, article);
	$.pop();
}

$.delegate(['click']);