import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';
import Custom from './Custom.svelte';
import { richColorsContext } from '$lib/internal/ctx.js';

var root = $.from_html(`<button class="button"> </button>`);

var root_1 = $.from_html(`<div><h2>Types</h2> <p>You can customize the type of toast you want to render, and pass an
		options object as the second argument.</p> <div class="buttons"></div> <!></div>`);

export default function Types($$anchor, $$props) {
	$.push($$props, true);

	const richColors = richColorsContext.get();

	const allTypes = [
		{
			name: 'Default',
			snippet: "toast('Event has been created')",
			action: () => {
				richColors.setRichColors(false);
				toast('Event has been created');
			}
		},

		{
			name: 'Description',
			snippet: `toast.message('Event has been created', {
				description: 'Monday, January 3rd at 6:00pm',
				})`,
			action: () => toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' })
		},

		{
			name: 'Success',
			snippet: "toast.success('Event has been created')",
			action: () => {
				richColors.setRichColors(false);
				toast.success('Event has been created');
			}
		},

		{
			name: 'Info',
			snippet: "toast.info('Event will be created')",
			action: () => {
				richColors.setRichColors(false);
				toast.info('Event will be created');
			}
		},

		{
			name: 'Warning',
			snippet: "toast.warning('Event has warnings')",
			action: () => {
				richColors.setRichColors(false);
				toast.warning('Event has warnings');
			}
		},

		{
			name: 'Error',
			snippet: "toast.error('Event has not been created')",
			action: () => {
				richColors.setRichColors(false);
				toast.error('Event has not been created');
			}
		},

		{
			name: 'Action',
			snippet: `toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  },
})`,

			action: () => toast.message('Event has been created', {
				action: { label: 'Undo', onClick: () => console.log('Undo') }
			})
		},

		{
			name: 'Promise',
			snippet: `const promise = new Promise((resolve, reject) => setTimeout(() => {
  if (Math.random() > 0.5) {
    resolve({ name: 'Svelte Sonner' });
  } else {
    reject();
  }
}, 1500));

toast.promise(promise, {
  loading: 'Loading...',
  success: (data) => {
    return data.name +  " toast has been added";
  },
  error: 'Error... :( Try again!',
});`,

			action: () => toast.promise(
				() => new Promise((resolve) => setTimeout(
					() => {
						resolve({ name: 'Svelte Sonner' });
					},
					1500
				)),
				{
					loading: 'Loading...',
					success: (data) => {
						return `${data.name} toast has been added`;
					},
					error: 'Error... :( Try again!'
				}
			)
		},

		{
			name: 'Custom',
			snippet: `import Custom from './Custom.svelte'

toast(Custom)`,
			action: () => toast(Custom, { duration: 1000000 })
		}
	];

	let activeType = $.state($.proxy(allTypes[0]));
	var div = root_1();
	var div_1 = $.sibling($.child(div), 4);

	$.each(div_1, 21, () => allTypes, (type) => type.name, ($$anchor, type) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => {
			$.set_attribute(button, 'data-testid', $.get(type).name);
			$.set_attribute(button, 'data-active', $.get(activeType)?.name === $.get(type).name);
			$.set_text(text, $.get(type).name);
		});

		$.delegated('click', button, () => {
			$.get(type).action?.();
			$.set(activeType, $.get(type), true);
		});

		$.append($$anchor, button);
	});

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => $.get(activeType)?.snippet);

		CodeBlock(node, {
			get code() {
				return $.get($0);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);