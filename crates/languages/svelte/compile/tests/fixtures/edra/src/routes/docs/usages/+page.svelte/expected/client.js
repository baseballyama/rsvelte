import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { resolve } from '$app/paths';
import { uploadCode, shadcnUsageCode, headlessUsageCode } from './code.ts';

var root = $.from_html(`<!> Configuration`, 1);
var root_1 = $.from_html(`Data & Serialization <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Usages & File Uploads</h1> <p class="lead">Learn how to configure Edra in your application, manage editor state, and implement custom media
		file uploads.</p> <hr class="my-6"/> <h2>Handling File Uploads</h2> <p>Edra provides a unified media placeholder node that supports uploading images, videos, and audio
		files. By configuring the <code>onFileUpload</code> callback, you can capture the file when it is
		dropped, pasted, or selected via the file manager, upload it to your remote storage, and insert it
		back into the document.</p> <p>The upload handler function should receive a standard <code>File</code> object and return a <code>Promise&lt;string&gt;</code> that resolves to the public URL of the uploaded asset:</p> <div class="my-4"><!></div> <h2>1. Shadcn UI Flavor</h2> <p>To use Edra with the preconfigured Tailwind CSS / shadcn-svelte toolbar and components layout,
		pass the <code>onFileUpload</code> handler inside the <code>createEditor</code> options:</p> <div class="my-4"><!></div> <h2>2. Headless UI Flavor</h2> <p>If you prefer using the headless logical core flavor to build your own custom editor wrapper and
		styling, pass <code>onFileUpload</code> in the exact same manner when calling <code>createEditor</code> from the headless entrypoint:</p> <div class="my-4"><!></div> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var article = root_2();

	$.head('18j0b13', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Usages | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 12);
	var node = $.child(div);

	Code(node, {
		get code() {
			return uploadCode;
		},
		language: 'typescript'
	});

	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var node_1 = $.child(div_1);

	Code(node_1, {
		get code() {
			return shadcnUsageCode;
		},
		language: 'svelte'
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var node_2 = $.child(div_2);

	Code(node_2, {
		get code() {
			return headlessUsageCode;
		},
		language: 'svelte'
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	{
		let $0 = $.derived(() => resolve('/docs/configuration'));

		Button(node_3, {
			get href() {
				return $.get($0);
			},
			variant: 'outline',
			class: 'gap-2',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_4 = $.first_child(fragment);

				ArrowLeft(node_4, {});
				$.next();
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => resolve('/docs/usages/serialization'));

		Button(node_5, {
			get href() {
				return $.get($0);
			},
			class: 'gap-2',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_1 = root_1();
				var node_6 = $.sibling($.first_child(fragment_1));

				ArrowRight(node_6, {});
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_3);
	$.reset(article);
	$.append($$anchor, article);
	$.pop();
}