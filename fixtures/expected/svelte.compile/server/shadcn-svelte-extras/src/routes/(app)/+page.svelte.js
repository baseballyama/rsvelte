import * as $ from 'svelte/internal/server';

import {
	ReviewForm,
	ConfigureDevice,
	PhoneNumberSetting,
	CodeBlock,
	EditorFileTree,
	FileDropZone,
	Terminal,
	PmCommand,
	SignupForm,
	StepperExample,
	GithubMerge
} from '$lib/components/docs/examples';

import { Snippet } from '$lib/components/ui/snippet';
import SearchButton from '$lib/components/search-button.svelte';
import ChatExample from '$lib/demos/chat.svelte';
import { TagsInput } from '$lib/components/ui/tags-input';
import Button from '$lib/components/button.svelte';
import { Badge } from '$lib/components/ui/badge';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

export default function _page($$renderer) {
	let tags = ['shadcn-svelte', 'extras'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col items-center gap-8"><div class="flex flex-col items-center gap-2 py-6 md:py-10 lg:py-20">`);

		Badge($$renderer, {
			href: '/docs/components/split-button',
			variant: 'secondary',
			class: 'rounded-full',
			children: ($$renderer) => {
				$$renderer.push(`<!---->🎉 New Component: Split Button `);
				ArrowRightIcon($$renderer, { class: 'size-4 shrink-0' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h1 class="text-center text-5xl font-medium">shadcn-svelte-extras</h1> <p class="text-center text-lg">Finish your component library with beautiful, composable components.</p> <div class="mt-2 flex place-items-center gap-2">`);

		Button($$renderer, {
			href: '/docs/installation',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get Started`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'ghost',
			href: '/components',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Browse Components`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="container grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"><div class="flex flex-col gap-4 lg:col-start-1">`);
		ChatExample($$renderer, {});
		$$renderer.push(`<!----> `);
		GithubMerge($$renderer, {});
		$$renderer.push(`<!----> `);

		TagsInput($$renderer, {
			placeholder: 'Add a tag',
			get value() {
				return tags;
			},

			set value($$value) {
				tags = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		ReviewForm($$renderer, {});
		$$renderer.push(`<!----> `);
		SearchButton($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col gap-4 2xl:hidden">`);
		SignupForm($$renderer, {});
		$$renderer.push(`<!----> `);
		EditorFileTree($$renderer, {});
		$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-4 lg:col-start-2">`);
		PhoneNumberSetting($$renderer, {});
		$$renderer.push(`<!----> `);
		CodeBlock($$renderer, {});
		$$renderer.push(`<!----> `);
		ConfigureDevice($$renderer, {});
		$$renderer.push(`<!----> `);
		StepperExample($$renderer, {});
		$$renderer.push(`<!----> `);
		Snippet($$renderer, { text: 'npx shadcn-svelte@next init' });
		$$renderer.push(`<!----> `);
		FileDropZone($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col gap-4 2xl:hidden">`);
		Terminal($$renderer, {});
		$$renderer.push(`<!----> `);
		PmCommand($$renderer, {});
		$$renderer.push(`<!----></div></div> <div class="hidden flex-col gap-4 2xl:col-start-3 2xl:flex">`);
		Terminal($$renderer, {});
		$$renderer.push(`<!----> `);
		PmCommand($$renderer, {});
		$$renderer.push(`<!----> `);
		SignupForm($$renderer, {});
		$$renderer.push(`<!----> `);
		EditorFileTree($$renderer, {});
		$$renderer.push(`<!----></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}