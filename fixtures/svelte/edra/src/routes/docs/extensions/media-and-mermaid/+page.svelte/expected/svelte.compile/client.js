import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Markdown`, 1);
var root_1 = $.from_html(`Callouts Extension <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Media & Mermaid</h1> <p class="lead">Embed and configure images, videos, audio, iframes, and dynamic Mermaid diagrams directly within
		the editor.</p> <hr class="my-6"/> <h2>Handling Uploads & Media Placeholders</h2> <p>Edra provides a seamless media uploading experience out of the box. When a user drags and drops
		a file, pastes an image from their clipboard, or uses the Slash Command to upload a file, Edra
		inserts a <code>MediaPlaceholder</code> node into the document.</p> <p>This placeholder displays a beautiful loading animation while your <code>onFileUpload</code> callback (configured during <code>createEditor</code>) processes the file. Once the upload
		resolves, the placeholder is automatically swapped out for the appropriate media node (Image,
		Video, or Audio).</p> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Images</h2> <p>Edra extends standard images using the custom <code>ImageExtended</code> extension. This includes
		sizing wrappers, captions, alignment toggles (left, right, center), and resizing handles.</p> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Videos & Audio</h2> <p>Videos are rendered using the <code>VideoExtended</code> wrapper, and audio is rendered using
		the custom <code>Audio</code> extension. Both support captions and alignment.</p> <div class="my-4"><!></div> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Iframes & HTML Pasting</h2> <p>Edra allows you to embed YouTube, Vimeo, Spotify, Google Maps, and other external services
		natively using the <code>Iframe</code> extension.</p> <div class="callout my-6 rounded-md border-l-4 border-l-amber-500 bg-amber-500/10 p-4"><p class="m-0 font-medium text-amber-700 dark:text-amber-400">Pasting HTML Embeds</p> <p class="m-0 mt-2 text-sm">Thanks to the built-in <code>iframePasteHandler</code>, users can simply copy the raw HTML
			embed code provided by platforms like YouTube (e.g., <code>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>) and paste it directly into the editor.
			Edra will intercept the paste, parse the HTML, and automatically convert it into a functional
			iframe block!</p></div> <hr class="my-6"/> <h2>Mermaid Diagrams</h2> <p>Edra contains native support for rendering Mermaid diagrams. Create a code block and set the
		language identifier to <code>mermaid</code> to instantly render full diagram schemas in the page:</p> <div class="my-4"><!></div> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const imageCode = `// Insert an image via URL
editor.commands.setImage({ src: 'https://example.com/image.png', alt: 'Example' });`;

	const uploadExample = `// Triggering the file upload sequence manually (e.g. from a custom button)
editor.commands.uploadMedia(file);`;

	const videoCode = `// Insert a video via URL
editor.commands.setVideo({ src: 'https://example.com/video.mp4' });`;

	const audioCode = `// Insert an audio file
editor.commands.setAudio({ src: 'https://example.com/audio.mp3' });`;

	const mermaidCode = `// Mermaid diagram codeblock syntax
\`\`\`mermaid
graph TD
    A[Start] --> B(Process)
    B --> C{Decision}
    C -->|Yes| D[Success]
    C -->|No| E[Fail]
\`\`\``;

	var article = root_2();

	$.head('1fu69dg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Media & Mermaid | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 12);
	var node = $.child(div);

	Code(node, { code: uploadExample, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 8);
	var node_1 = $.child(div_1);

	Code(node_1, { code: imageCode, language: 'typescript' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 8);
	var node_2 = $.child(div_2);

	Code(node_2, { code: videoCode, language: 'typescript' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	Code(node_3, { code: audioCode, language: 'typescript' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 16);
	var node_4 = $.child(div_4);

	Code(node_4, { code: mermaidCode, language: 'markdown' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	Button(node_5, {
		href: '/docs/extensions/markdown',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_6 = $.first_child(fragment);

			ArrowLeft(node_6, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 2);

	Button(node_7, {
		href: '/docs/extensions/callout',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_8 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_8, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(article);
	$.append($$anchor, article);
}