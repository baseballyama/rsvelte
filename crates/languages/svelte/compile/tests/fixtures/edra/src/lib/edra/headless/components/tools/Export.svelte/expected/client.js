import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Root, Trigger, Content, Label, Item } from '../../primitives/dropdown/index.ts';
import { getEditor } from '../../../tiptap/index.js';
import { ChevronDown, Download } from '@lucide/svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

var root_2 = $.from_html(
	`<!> <style>:global(.chevron-icon) {
			color: var(--edra-mute);
			width: 0.5rem;
			height: 0.5rem;
		}</style> <!>`,
	1
);

export default function Export($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	const handleExport = (as) => {
		let text = '';
		let mimeType = '';
		let extension = '';

		switch (as) {
			case 'markdown':
				text = editor.getMarkdown();
				mimeType = 'text/markdown;charset=utf-8';
				extension = 'md';
				break;

			case 'html':
				text = editor.getHTML();
				mimeType = 'text/html;charset=utf-8';
				extension = 'html';
				break;

			case 'json':
				text = JSON.stringify(editor.getJSON(), null, 2);
				mimeType = 'application/json;charset=utf-8';
				extension = 'json';
				break;
		}

		// Try to find a title from the first heading, or use a default
		let filename = 'document';

		const firstNode = editor.state.doc.firstChild;

		if (firstNode && firstNode.type.name === 'heading') {
			const textContent = firstNode.textContent.trim();

			if (textContent) {
				filename = textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
			}
		}

		if (!filename) {
			filename = 'document';
		}

		const blob = new Blob([text], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${filename}.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	Root($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Trigger(node, {
				class: 'edra-btn edra-btn-ghost edra-btn-icon',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Download(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					ChevronDown(node_2, { class: 'chevron-icon' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 4);

			Content(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					Label(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Export As');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Item(node_5, {
						onclick: () => handleExport('markdown'),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Markdown');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Item(node_6, {
						onclick: () => handleExport('html'),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('HTML');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Item(node_7, {
						onclick: () => handleExport('json'),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('JSON');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}