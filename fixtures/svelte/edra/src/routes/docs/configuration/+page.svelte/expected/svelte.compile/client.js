import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Installation`, 1);
var root_1 = $.from_html(`Usages <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Configuration & API</h1> <p class="lead">Learn how to instantiate Edra, configure its behavior, and hook into core events like media
		uploads and content updates.</p> <hr class="my-6"/> <h2>Instantiating the Editor</h2> <p>Edra provides a <code>createEditor</code> function that returns a fully configured TipTap instance
		with all of Edra's custom extensions and event bindings attached.</p> <p>The <code>createEditor</code> function accepts an optional <code>EdraEditorProps</code> object:</p> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Editor Props Breakdown</h2> <h3><code>extensions</code></h3> <p>An optional array of TipTap extensions. You can use this to add new functionality to the editor
		or override the default extensions provided by Edra.</p> <h3><code>collaborative</code></h3> <p>When set to <code>true</code>, this disables the default StarterKit history (undo/redo)
		extension. This is required when using Yjs for collaboration because collaborative editing
		handles its own history.</p> <h3><code>onUpdate</code></h3> <p>This callback is fired whenever the document content changes. You can use it to sync the
		editor's state to your parent component, validate data, or trigger autosaves.</p> <h3><code>onFileUpload</code></h3> <p>Whenever a user pastes, drags and drops, or uses the Slash Menu to insert an Image, Video, or
		Audio file, Edra needs to know how to upload it to your storage provider (like AWS S3, Vercel
		Blob, Cloudinary, etc.).</p> <p>Edra will automatically render a beautiful loading placeholder in the document while this
		promise resolves. Once the promise resolves with a URL string, the placeholder is replaced with
		the actual media block.</p> <div class="callout my-6 rounded-md border-l-4 border-l-blue-500 bg-blue-500/10 p-4"><p class="m-0 font-medium text-blue-700 dark:text-blue-400">Note on Base64 Images</p> <p class="m-0 mt-2 text-sm">If you do not provide an <code>onFileUpload</code> callback, Edra will attempt to use standard base64
			data URIs for images. However, this is heavily discouraged for production as it severely degrades
			performance.</p></div> <h3><code>callAI</code></h3> <p>If you want to use the AI Assistant extension, you must provide this callback to communicate
		with your AI backend route (like an OpenAI streaming endpoint). Edra handles the UI and the
		streaming chunk injection into the document, but you must provide the network request logic.</p> <hr class="my-6"/> <h2>Example Configuration</h2> <div class="my-4"><!></div> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const propsInterface = `import type { Extensions } from '@tiptap/core';

export interface EdraEditorProps {
	/** Custom extensions to add or override default Edra extensions */
	extensions?: Extensions;

	/** Callback invoked whenever the editor content or state changes */
	onUpdate?: () => void;
	
	/**
	 * When true, disables StarterKit history (undo/redo) for use with
	 * Yjs Collaboration. Required because Collaboration handles its own history.
	 */
	collaborative?: boolean;

	/**
	 * Callback function to handle file uploads when a user drags/drops, pastes,
	 * or selects a media file (image, video, audio) to insert.
	 *
	 * @param file The file to be uploaded.
	 * @returns A promise resolving to the uploaded file's URL.
	 */
	onFileUpload?: (file: File) => Promise<string>;
	
	/**
	 * Callback to handle AI completion streaming. 
	 */
	callAI?: (
		prompt: string,
		onChunk: (chunk: string) => void,
		onError: (error: Error) => void
	) => Promise<void>;
}`;

	const initExample = `import { createEditor, Edra } from '$lib/edra/shadcn/index.js';

const editor = createEditor({
	onUpdate: () => {
		console.log('Editor content changed!', editor.getJSON());
	},
	onFileUpload: async (file: File) => {
		// Example: Uploading to Vercel Blob or an S3 bucket
		const response = await fetch('/api/upload', {
			method: 'POST',
			body: file
		});
		const data = await response.json();
		return data.url; // Return the public URL to embed it in the editor
	}
});`;

	var article = root_2();

	$.head('1q9ccmj', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Configuration & API | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 12);
	var node = $.child(div);

	Code(node, { code: propsInterface, language: 'ts' });
	$.reset(div);

	var div_1 = $.sibling(div, 34);
	var node_1 = $.child(div_1);

	Code(node_1, { code: initExample, language: 'ts' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/installation',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			ArrowLeft(node_3, {});
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		href: '/docs/usages',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_5 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(article);
	$.append($$anchor, article);
}