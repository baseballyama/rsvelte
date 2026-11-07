import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`🎉 New Component: Split Button <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-8"><div class="flex flex-col items-center gap-2 py-6 md:py-10 lg:py-20"><!> <h1 class="text-center text-5xl font-medium">shadcn-svelte-extras</h1> <p class="text-center text-lg">Finish your component library with beautiful, composable components.</p> <div class="mt-2 flex place-items-center gap-2"><!> <!></div></div> <div class="container grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"><div class="flex flex-col gap-4 lg:col-start-1"><!> <!> <!> <!> <!> <div class="flex flex-col gap-4 2xl:hidden"><!> <!></div></div> <div class="flex flex-col gap-4 lg:col-start-2"><!> <!> <!> <!> <!> <!> <div class="flex flex-col gap-4 2xl:hidden"><!> <!></div></div> <div class="hidden flex-col gap-4 2xl:col-start-3 2xl:flex"><!> <!> <!> <!></div></div></div>`);

export default function _page($$anchor) {
	let tags = $.state($.proxy(['shadcn-svelte', 'extras']));
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Badge(node, {
		href: '/docs/components/split-button',
		variant: 'secondary',
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			ArrowRightIcon(node_1, { class: 'size-4 shrink-0' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 6);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/installation',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		variant: 'ghost',
		href: '/components',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Browse Components');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_4 = $.child(div_4);

	ChatExample(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	GithubMerge(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	TagsInput(node_6, {
		placeholder: 'Add a tag',
		get value() {
			return $.get(tags);
		},

		set value($$value) {
			$.set(tags, $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	ReviewForm(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	SearchButton(node_8, {});

	var div_5 = $.sibling(node_8, 2);
	var node_9 = $.child(div_5);

	SignupForm(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	EditorFileTree(node_10, {});
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var node_11 = $.child(div_6);

	PhoneNumberSetting(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	CodeBlock(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	ConfigureDevice(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	StepperExample(node_14, {});

	var node_15 = $.sibling(node_14, 2);

	Snippet(node_15, { text: 'npx shadcn-svelte@next init' });

	var node_16 = $.sibling(node_15, 2);

	FileDropZone(node_16, {});

	var div_7 = $.sibling(node_16, 2);
	var node_17 = $.child(div_7);

	Terminal(node_17, {});

	var node_18 = $.sibling(node_17, 2);

	PmCommand(node_18, {});
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var node_19 = $.child(div_8);

	Terminal(node_19, {});

	var node_20 = $.sibling(node_19, 2);

	PmCommand(node_20, {});

	var node_21 = $.sibling(node_20, 2);

	SignupForm(node_21, {});

	var node_22 = $.sibling(node_21, 2);

	EditorFileTree(node_22, {});
	$.reset(div_8);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}