import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';
import Test from './Test.svelte';
import TestWithProps from './TestWithProps.svelte';
import { getOtherCodeSnippet } from './code-snippets.js';

var root = $.from_html(`<button class="button"> <!></button>`);
var root_1 = $.from_html(`<div><h2>Other</h2> <div class="buttons"></div> <!></div>`);

export default function Other($$anchor, $$props) {
	$.push($$props, true);

	let closeButton = $.prop($$props, 'closeButton', 15, false),
		setRichColors = $.prop($$props, 'setRichColors', 3, () => {});

	const allTypes = [
		{
			name: 'Rich Colors Success',
			snippet: "toast.success('Event has been created')",
			action: () => {
				toast.success('Event has been created');
				setRichColors()(true);
			}
		},

		{
			name: 'Rich Colors Error',
			snippet: "toast.error('Event has not been created')",
			action: () => {
				toast.error('Event has not been created');
				setRichColors()(true);
			}
		},

		{
			name: 'Rich Colors Info',
			snippet: "toast.info('Info')",
			action: () => {
				toast.info('Be at the area 10 minutes before the event time');
				setRichColors()(true);
			}
		},

		{
			name: 'Rich Colors Warning',
			snippet: "toast.warning('Warning')",
			action: () => {
				toast.warning('Event start time cannot be earlier than 8am');
				setRichColors()(true);
			}
		},

		{
			name: 'Close buttons',
			snippet: `toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm',
  })`,

			action: () => {
				toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
				closeButton(!closeButton());
			}
		},

		{
			name: 'Headless',
			snippet: `import HeadlessToast from './HeadlessToast.svelte'

  toast.custom(HeadlessToast)

  // With props:
  toast.custom(HeadlessToast, {
    componentProps: {
      eventName: 'Louvre Museum'
    }
  })
  `,

			action: () => {
				toast.custom(Test, { componentProps: { eventName: 'Louvre Museum' } });
			}
		},

		{
			name: 'Custom with properties',
			snippet: `import TestWithProps from './TestWithProps.svelte'

  toast.warning(TestWithProps, {
    componentProps: {
      message: 'This is <br />multiline message',
    }
  })
  `,

			action: () => {
				toast.warning(TestWithProps, {
					componentProps: { message: 'This is <br />multiline message' }
				});
			}
		}
	];

	let activeType = $.state($.proxy(allTypes[0]));
	const richColorsActive = $.derived(() => $.get(activeType)?.name?.includes('Rich') ?? false);
	const closeButtonActive = $.derived(() => $.get(activeType)?.name?.includes('Close') ?? false);
	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => allTypes, (type) => type.name, ($$anchor, type) => {
		var button = root();
		var text = $.child(button);
		var node = $.sibling(text);

		{
			var consequent = ($$anchor) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, `(${closeButton() ? 'Visible' : 'Hidden'})`));
				$.append($$anchor, text_1);
			};

			$.if(node, ($$render) => {
				if ($.get(type).name === 'Close buttons') $$render(consequent);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'data-testid', `other-${$.get(type).name}`);
			$.set_attribute(button, 'data-active', $.get(activeType)?.name === $.get(type).name);
			$.set_text(text, `${$.get(type).name ?? ''} `);
		});

		$.delegated('click', button, () => {
			$.get(type).action?.();
			$.set(activeType, $.get(type), true);
		});

		$.append($$anchor, button);
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => getOtherCodeSnippet($.get(activeType)?.snippet ?? '', $.get(richColorsActive), $.get(closeButtonActive)));

		CodeBlock(node_1, {
			get code() {
				return $.get($0);
			},
			language: 'svelte'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);