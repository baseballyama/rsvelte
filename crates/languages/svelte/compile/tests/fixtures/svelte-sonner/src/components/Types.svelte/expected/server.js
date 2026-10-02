import * as $ from 'svelte/internal/server';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';
import Custom from './Custom.svelte';
import { richColorsContext } from '$lib/internal/ctx.js';

export default function Types($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let activeType = allTypes[0];

		$$renderer.push(`<div><h2>Types</h2> <p>You can customize the type of toast you want to render, and pass an
		options object as the second argument.</p> <div class="buttons"><!--[-->`);

		const each_array = $.ensure_array_like(allTypes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let type = each_array[$$index];

			$$renderer.push(`<button class="button"${$.attr('data-testid', type.name)}${$.attr('data-active', activeType?.name === type.name)}>${$.escape(type.name)}</button>`);
		}

		$$renderer.push(`<!--]--></div> `);
		CodeBlock($$renderer, { code: activeType?.snippet });
		$$renderer.push(`<!----></div>`);
	});
}