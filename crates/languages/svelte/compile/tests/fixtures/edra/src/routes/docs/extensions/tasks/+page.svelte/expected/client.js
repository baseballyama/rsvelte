import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Tables`, 1);
var root_1 = $.from_html(`Typography & Colors <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Task List Extension</h1> <p class="lead">Build interactive checklists with nested task items that users can toggle directly from the
		editor view.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The task list is powered by <code>@tiptap/extension-list</code>. It allows creating list items
		with checkboxes that are fully interactive. Nested lists are supported out of the box, allowing
		hierarchical checklists.</p> <div class="my-4"><!></div> <h2>Keyboard Shortcuts</h2> <p>Users can interact with task lists using these standard keys:</p> <ul class="mt-4 list-disc space-y-2 pl-6"><li><code>Enter</code>: Creates a new checklist item at the current level.</li> <li><code>Tab</code>: Indents the active item, nesting it under the item above.</li> <li><code>Shift + Tab</code>: Outdents the active item to bring it to a higher level.</li></ul> <h2>Styling Checklist Items</h2> <p>Inside Edra, checkbox states, custom checkmarks, and line-through styles for completed items are
		defined globally in <code>editor.css</code>. Checkboxes are aligned cleanly with standard text
		fonts and support standard hover interactions.</p> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const taskCode = `import { TaskList, TaskItem } from '@tiptap/extension-list';

// Task list & item extensions are loaded as follows:
// TaskList
// TaskItem.configure({ nested: true })

// Programmatic command to toggle task list:
editor.chain().focus().toggleTaskList().run();`;

	var article = root_2();

	$.head('1ib3z8w', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Task List | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: taskCode, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 12);
	var node_1 = $.child(div_1);

	Button(node_1, {
		href: '/docs/extensions/tables',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			ArrowLeft(node_2, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		href: '/docs/extensions/typography-and-colors',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_4 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_4, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(article);
	$.append($$anchor, article);
}