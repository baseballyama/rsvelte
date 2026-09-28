import * as $ from 'svelte/internal/server';
import { Maximize2, Minimize2 } from 'lucide-svelte';
import { onMount } from 'svelte';
import OpenInStackblitz from './OpenInStackblitz.svelte';
import { getAllAppModules } from './globLoader';

export default function SvelteWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			path,
			files,
			hideCode,
			hideStackblitz = false,
			iframe,
			class: cls = ''
		} = $$props;

		const allAppModules = getAllAppModules();
		let mounted = false;
		let fullscreen = false;
		let iframeElement = void 0;
		let iframeWindow = null;
		const AppModule = Object.entries(allAppModules).find(([key]) => key.includes(path) && key.endsWith('App.svelte'))?.[1];

		const handleKeyDown = (event) => {
			if (event.key === 'Escape' && fullscreen) {
				fullscreen = false;
			}
		};

		const detachIframeEscapeListener = () => {
			iframeWindow?.removeEventListener('keydown', handleKeyDown);
			iframeWindow = null;
		};

		const attachIframeEscapeListener = () => {
			detachIframeEscapeListener();

			try {
				iframeWindow = iframeElement?.contentWindow ?? null;
				iframeWindow?.addEventListener('keydown', handleKeyDown);
			} catch {
				iframeWindow = null;
			}
		};

		onMount(() => {
			mounted = true;
			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				detachIframeEscapeListener();
			};
		});

		$$renderer.push(`<div${$.attr_class($.clsx([
			'relative mt-4 h-[80vh] w-full overflow-hidden rounded-t-md border border-white/20 bg-blue-900',
			hideCode && !fullscreen && 'rounded-md!',
			fullscreen && 'fixed! inset-0 z-50 mt-0! h-[100dvh]! w-screen! rounded-none! border-0!',
			!fullscreen && cls
		]))}>`);

		if (iframe) {
			$$renderer.push(`<!--[0--><iframe${$.attr('src', `${$.stringify(import.meta.env.BASE_URL)}examples/${$.stringify(path)}`)}${$.attr('title', path)} class="h-full w-full border-none" onload="this.__e=event"></iframe>`);
		} else if (mounted && AppModule) {
			$$renderer.push('<!--[1-->');

			$.await($$renderer, AppModule(), () => {}, (Mod) => {
				if (Mod.default) {
					$$renderer.push('<!--[-->');
					Mod.default($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			});

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="absolute top-3 left-3 m-0 flex items-center gap-2"><button class="border-orange/5 text-orange m-0 flex size-7 cursor-pointer items-center justify-center rounded-xs border bg-orange-800/50 backdrop-blur-md hover:bg-orange-800/70 hover:text-orange-400 focus:outline-hidden"${$.attr('aria-label', fullscreen
			? 'Close fullscreen example'
			: 'Open example fullscreen')}${$.attr('aria-pressed', fullscreen)}${$.attr('title', fullscreen ? 'Close fullscreen' : 'Open fullscreen')}>`);

		if (fullscreen) {
			$$renderer.push('<!--[0-->');
			Minimize2($$renderer, { class: 'size-5' });
		} else {
			$$renderer.push('<!--[-1-->');
			Maximize2($$renderer, { class: 'size-5' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!hideStackblitz) {
			$$renderer.push('<!--[0-->');
			OpenInStackblitz($$renderer, { files });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}