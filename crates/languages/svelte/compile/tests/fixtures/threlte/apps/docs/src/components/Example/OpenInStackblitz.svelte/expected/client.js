import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { files as projectTemplate } from './stackblitz-template';
import sdk from '@stackblitz/sdk';

var root = $.from_html(`<button class="border-orange/5 text-orange group/stackblitz m-0 flex h-7 w-7 cursor-pointer items-center gap-1.5 overflow-hidden rounded-xs border bg-orange-800/50 px-[5px] text-sm whitespace-nowrap backdrop-blur-md transition-all duration-200 hover:w-[102px] hover:bg-orange-800/70 hover:text-orange-400 focus:w-[102px] focus:outline-hidden" aria-label="Open in StackBlitz" title="Open in StackBlitz"><svg class="size-4 shrink-0 fill-current" viewBox="0 0 15 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.00084 11.8188H0L10.9693 0L8.01714 8.18289H14.0187L3.04798 20L6.00084 11.8188Z"></path></svg> <span class="max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/stackblitz:max-w-16 group-hover/stackblitz:opacity-100 group-focus/stackblitz:max-w-16 group-focus/stackblitz:opacity-100">StackBlitz</span></button>`);

export default function OpenInStackblitz($$anchor, $$props) {
	$.push($$props, true);

	const projectFiles = $.derived(() => {
		const results = {};

		for (const path in $$props.files) {
			const newPath = `src/example/${path}`;

			results[newPath] = $$props.files[path];
		}

		return results;
	});

	const onclick = () => {
		sdk.openProject(
			{
				title: 'Threlte example',
				description: '',
				files: { ...projectTemplate, ...$.get(projectFiles) },
				template: 'node'
			},
			{ openFile: 'src/example/App.svelte' }
		);
	};

	var button = root();

	$.delegated('click', button, onclick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);