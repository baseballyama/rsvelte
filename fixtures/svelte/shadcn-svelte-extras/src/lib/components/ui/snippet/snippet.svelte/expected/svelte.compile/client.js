import 'svelte/internal/disclose-version';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';
import { CopyButton } from '../copy-button';
import * as $ from 'svelte/internal/client';

const style = tv({
	base: 'bg-background relative w-full max-w-full rounded-md border py-2.5 pr-12 pl-3',
	variants: {
		variant: {
			default: 'border-border bg-card',
			secondary: 'border-border bg-accent',
			destructive: 'border-destructive bg-destructive',
			primary: 'border-primary bg-primary text-primary-foreground'
		}
	}
});

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Snippet($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, 'default');
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var pre = root();
			var text_1 = $.only_child(pre);

			$.template_effect(
				($0) => {
					$.set_class(pre, 1, $0);

					$.set_text(text_1, `
			${$$props.text ?? ''}
		`);
				},
				[
					() => $.clsx(cn('overflow-y-auto text-left font-mono text-sm font-light whitespace-nowrap'))
				]
			);

			$.append($$anchor, pre);
		};

		var alternate = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $$props.text, $.index, ($$anchor, line) => {
				var pre_1 = root();
				var text_2 = $.only_child(pre_1);

				$.template_effect(
					($0) => {
						$.set_class(pre_1, 1, $0);

						$.set_text(text_2, `
			${$.get(line) ?? ''}
		`);
					},
					[
						() => $.clsx(cn('overflow-y-auto text-left font-mono text-sm font-light whitespace-nowrap'))
					]
				);

				$.append($$anchor, pre_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.text == 'string') $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => typeof $$props.text === 'string' ? $$props.text : $$props.text.join('\n'));

		CopyButton(node_2, {
			class: 'hover:text-opacity-80 absolute top-1/2 right-2 size-7 -translate-y-1/2 transition-opacity ease-in-out hover:bg-transparent dark:hover:bg-transparent',
			get text() {
				return $.get($0);
			},

			get onCopy() {
				return $$props.onCopy;
			}
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn(style({ variant: variant(), className: $$props.class })))
	]);

	$.append($$anchor, div);
	$.pop();
}