import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/card/Card.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'dir',
	'path',
	'thumbnailSize'
]);

var root = $.from_html(`<div class="flex items-center justify-between rounded-t-md border-b border-gray-200 bg-gray-50 px-5 py-2.5 dark:border-gray-700 dark:bg-gray-700"><span class="text-base font-medium text-gray-900 dark:text-white"> </span> <span class="text-gray-500 dark:text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></span></div> <div class="flex h-52 items-center justify-center"><div><span style="box-sizing: border-box; display: block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: absolute; inset: 0px;"><img decoding="async" data-nimg="fill" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; object-fit: contain;" sizes="100vw"/> <noscript></noscript></span></div> <div><span style="box-sizing: border-box; display: block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: absolute; inset: 0px;"><img decoding="async" data-nimg="fill" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; object-fit: contain;"/> <noscript></noscript></span></div></div>`, 1);

export default function CompoCard($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let lowerDir = $.derived(() => $$props.dir.toLowerCase());

	Card($$anchor, $.spread_props(
		{
			get href() {
				return `/docs/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}/`;
			}
		},
		() => restProps,
		{
			class: 'dark:hover:shadow-lg-light max-w-none! shadow-none hover:shadow-lg dark:hover:bg-gray-900',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var span = $.child(div);
				var text = $.only_child(span, true);

				$.next(2);
				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var div_2 = $.child(div_1);
				var span_1 = $.child(div_2);
				var img = $.child(span_1);

				$.next(2);
				$.reset(span_1);
				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var span_2 = $.child(div_3);
				var img_1 = $.child(span_2);

				$.next(2);
				$.reset(span_2);
				$.reset(div_3);
				$.reset(div_1);

				$.template_effect(() => {
					$.set_text(text, $$props.name);
					$.set_class(div_2, 1, `relative block h-5/6 dark:hidden ${($$props.thumbnailSize ? $$props.thumbnailSize : 'w-56') ?? ''}`);
					$.set_attribute(img, 'alt', $$props.name);
					$.set_attribute(img, 'src', `/images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg`);
					$.set_attribute(img, 'srcset', `/images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 640w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 750w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 828w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 1080w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 1200w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 1920w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 2048w, /images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}.svg 3840w`);
					$.set_class(div_3, 1, `relative hidden h-5/6 dark:block ${($$props.thumbnailSize ? $$props.thumbnailSize : 'w-56') ?? ''}`);
					$.set_attribute(img_1, 'alt', $$props.name);
					$.set_attribute(img_1, 'src', `/images/${$.get(lowerDir) ?? ''}${$$props.path ?? ''}-dark.svg`);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}