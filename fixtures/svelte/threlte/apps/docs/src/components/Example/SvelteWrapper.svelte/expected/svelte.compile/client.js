import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Maximize2, Minimize2 } from 'lucide-svelte';
import { onMount } from 'svelte';
import OpenInStackblitz from './OpenInStackblitz.svelte';
import { getAllAppModules } from './globLoader';

var root = $.from_html(`<iframe class="h-full w-full border-none"></iframe>`);
var root_1 = $.from_html(`<div><!> <div class="absolute top-3 left-3 m-0 flex items-center gap-2"><button class="border-orange/5 text-orange m-0 flex size-7 cursor-pointer items-center justify-center rounded-xs border bg-orange-800/50 backdrop-blur-md hover:bg-orange-800/70 hover:text-orange-400 focus:outline-hidden"><!></button> <!></div></div>`);

export default function SvelteWrapper($$anchor, $$props) {
	$.push($$props, true);

	let hideStackblitz = $.prop($$props, 'hideStackblitz', 3, false),
		cls = $.prop($$props, 'class', 3, '');

	const allAppModules = getAllAppModules();
	let mounted = $.state(false);
	let fullscreen = $.state(false);
	let iframeElement = $.state(void 0);
	let iframeWindow = null;
	const AppModule = Object.entries(allAppModules).find(([key]) => key.includes($$props.path) && key.endsWith('App.svelte'))?.[1];

	const handleKeyDown = (event) => {
		if (event.key === 'Escape' && $.get(fullscreen)) {
			$.set(fullscreen, false);
		}
	};

	const detachIframeEscapeListener = () => {
		iframeWindow?.removeEventListener('keydown', handleKeyDown);
		iframeWindow = null;
	};

	const attachIframeEscapeListener = () => {
		detachIframeEscapeListener();

		try {
			iframeWindow = $.get(iframeElement)?.contentWindow ?? null;
			iframeWindow?.addEventListener('keydown', handleKeyDown);
		} catch {
			iframeWindow = null;
		}
	};

	onMount(() => {
		$.set(mounted, true);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			detachIframeEscapeListener();
		};
	});

	$.user_effect(() => {
		if (!$.get(fullscreen)) return;

		const { body, documentElement } = document;
		const bodyOverflow = body.style.overflow;
		const documentOverflow = documentElement.style.overflow;

		body.style.overflow = 'hidden';
		documentElement.style.overflow = 'hidden';

		return () => {
			body.style.overflow = bodyOverflow;
			documentElement.style.overflow = documentOverflow;
		};
	});

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var iframe_1 = root();

			$.bind_this(iframe_1, ($$value) => $.set(iframeElement, $$value), () => $.get(iframeElement));

			$.template_effect(() => {
				$.set_attribute(iframe_1, 'src', `${import.meta.env.BASE_URL ?? ''}examples/${$$props.path ?? ''}`);
				$.set_attribute(iframe_1, 'title', $$props.path);
			});

			$.event('load', iframe_1, attachIframeEscapeListener);
			$.replay_events(iframe_1);
			$.append($$anchor, iframe_1);
		};

		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.await(node_1, AppModule, null, ($$anchor, Mod) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => $.get(Mod).default, ($$anchor, Mod_default) => {
					Mod_default($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.iframe) $$render(consequent); else if ($.get(mounted) && AppModule) $$render(consequent_1, 1);
		});
	}

	var div_1 = $.sibling(node, 2);
	var button = $.child(div_1);
	var node_3 = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			Minimize2($$anchor, { class: 'size-5' });
		};

		var alternate = ($$anchor) => {
			Maximize2($$anchor, { class: 'size-5' });
		};

		$.if(node_3, ($$render) => {
			if ($.get(fullscreen)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_4 = $.sibling(button, 2);

	{
		var consequent_3 = ($$anchor) => {
			OpenInStackblitz($$anchor, {
				get files() {
					return $$props.files;
				}
			});
		};

		$.if(node_4, ($$render) => {
			if (!hideStackblitz()) $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx([
			'relative mt-4 h-[80vh] w-full overflow-hidden rounded-t-md border border-white/20 bg-blue-900',
			$$props.hideCode && !$.get(fullscreen) && 'rounded-md!',
			$.get(fullscreen) && 'fixed! inset-0 z-50 mt-0! h-[100dvh]! w-screen! rounded-none! border-0!',
			!$.get(fullscreen) && cls()
		]));

		$.set_attribute(button, 'aria-label', $.get(fullscreen)
			? 'Close fullscreen example'
			: 'Open example fullscreen');

		$.set_attribute(button, 'aria-pressed', $.get(fullscreen));
		$.set_attribute(button, 'title', $.get(fullscreen) ? 'Close fullscreen' : 'Open fullscreen');
	});

	$.delegated('click', button, () => $.set(fullscreen, !$.get(fullscreen)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);