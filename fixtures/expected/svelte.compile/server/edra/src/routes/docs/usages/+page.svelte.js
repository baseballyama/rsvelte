import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';
import { resolve } from '$app/paths';
import { uploadCode, shadcnUsageCode, headlessUsageCode } from './code.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('18j0b13', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Usages | Edra Docs</title>`);
			});
		});

		$$renderer.push(`<article class="prose dark:prose-invert max-w-none"><h1>Usages &amp; File Uploads</h1> <p class="lead">Learn how to configure Edra in your application, manage editor state, and implement custom media
		file uploads.</p> <hr class="my-6"/> <h2>Handling File Uploads</h2> <p>Edra provides a unified media placeholder node that supports uploading images, videos, and audio
		files. By configuring the <code>onFileUpload</code> callback, you can capture the file when it is
		dropped, pasted, or selected via the file manager, upload it to your remote storage, and insert it
		back into the document.</p> <p>The upload handler function should receive a standard <code>File</code> object and return a <code>Promise&lt;string></code> that resolves to the public URL of the uploaded asset:</p> <div class="my-4">`);

		Code($$renderer, { code: uploadCode, language: 'typescript' });

		$$renderer.push(`<!----></div> <h2>1. Shadcn UI Flavor</h2> <p>To use Edra with the preconfigured Tailwind CSS / shadcn-svelte toolbar and components layout,
		pass the <code>onFileUpload</code> handler inside the <code>createEditor</code> options:</p> <div class="my-4">`);

		Code($$renderer, { code: shadcnUsageCode, language: 'svelte' });

		$$renderer.push(`<!----></div> <h2>2. Headless UI Flavor</h2> <p>If you prefer using the headless logical core flavor to build your own custom editor wrapper and
		styling, pass <code>onFileUpload</code> in the exact same manner when calling <code>createEditor</code> from the headless entrypoint:</p> <div class="my-4">`);

		Code($$renderer, { code: headlessUsageCode, language: 'svelte' });
		$$renderer.push(`<!----></div> <div class="mt-12 flex justify-between">`);

		Button($$renderer, {
			href: resolve('/docs/configuration'),
			variant: 'outline',
			class: 'gap-2',
			children: ($$renderer) => {
				ArrowLeft($$renderer, {});
				$$renderer.push(`<!----> Configuration`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			href: resolve('/docs/usages/serialization'),
			class: 'gap-2',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Data &amp; Serialization `);
				ArrowRight($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></article>`);
	});
}