import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import Skeleton from '$lib/components/branding/skeleton.svelte';
import { routes } from '$lib/navigation/routes';
import DecorCorners from './decor-corners.svelte';
import DecorStripes from './decor-stripes.svelte';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';

var root = $.from_html(`<li><a class="inline-flex items-center gap-2 anchor"><!> <!></a></li>`);
var root_1 = $.from_html(`<nav class="space-y-4"><h2 class="font-bold capitalize"> </h2> <ul class="space-y-2"></ul></nav>`);
var root_2 = $.from_html(`<a class="text-xs hover:underline"> </a>`);
var root_3 = $.from_html(`<footer class="container mx-auto border-t border-l border-r border-surface-200-800"><!> <!> <div class="container-cell flex justify-between items-center gap-4"><div class="flex items-center gap-2"><a aria-label="Homepage" title="Homepage" class="inline-flex"><!></a> <a href="https://www.skeletonlabs.co/" target="_blank" class="text-xs hover:underline">Skeleton Labs</a></div> <div class="flex items-center gap-4"></div></div></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	// A subset of routes in a set order
	const navColuns = {
		// TODO
		// overview: routes.overview,
		design: routes.design,
		content: routes.content,
		links: routes.links
	};

	var footer = root_3();
	var node = $.child(footer);

	DecorCorners(node, {
		corners: ['tl', 'tr', 'bl', 'br'],
		class: 'container-cell grid grid-cols-2 md:grid-cols-3 gap-8',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => Object.entries(navColuns), ([section, items]) => section, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let section = () => $.get($$array)[0];
				let items = () => $.get($$array)[1];
				var nav = root_1();
				var h2 = $.child(nav);
				var text = $.only_child(h2, true);
				var ul = $.sibling(h2, 2);

				$.each(ul, 21, items, ({ label, href, icon: Icon, enabled }) => label, ($$anchor, $$item) => {
					let label = () => $.get($$item).label;
					let href = () => $.get($$item).href;
					let Icon = () => $.get($$item).icon;
					let enabled = () => $.get($$item).enabled;
					const external = $.derived(() => href().startsWith('http'));
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent_2 = ($$anchor) => {
							var li = root();
							var a = $.child(li);
							var node_3 = $.child(a);

							{
								var consequent = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, Icon, ($$anchor, Icon_1) => {
										Icon_1($$anchor, { class: 'size-elem-base' });
									});

									$.append($$anchor, fragment_2);
								};

								$.if(node_3, ($$render) => {
									if (Icon()) $$render(consequent);
								});
							}

							var text_1 = $.sibling(node_3);
							var node_5 = $.sibling(text_1);

							{
								var consequent_1 = ($$anchor) => {
									ArrowUpRightIcon($$anchor, { class: 'size-elem-base' });
								};

								$.if(node_5, ($$render) => {
									if ($.get(external)) $$render(consequent_1);
								});
							}

							$.reset(a);
							$.reset(li);

							$.template_effect(() => {
								$.set_attribute(a, 'href', href());
								$.set_attribute(a, 'target', $.get(external) ? '_blank' : undefined);
								$.set_attribute(a, 'rel', $.get(external) ? 'noopener noreferrer' : undefined);
								$.set_text(text_1, ` ${label() ?? ''} `);
							});

							$.append($$anchor, li);
						};

						$.if(node_2, ($$render) => {
							if (enabled()) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_1);
				});

				$.reset(ul);
				$.reset(nav);
				$.template_effect(() => $.set_text(text, section()));
				$.append($$anchor, nav);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	DecorStripes(node_6, { class: 'h-6' });

	var div = $.sibling(node_6, 2);
	var div_1 = $.child(div);
	var a_1 = $.child(div_1);
	var node_7 = $.child(a_1);

	Skeleton(node_7, { class: 'fill-current size-elem-2xl' });
	$.reset(a_1);
	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 21, () => routes.legal, ({ label, href }) => label, ($$anchor, $$item) => {
		let label = () => $.get($$item).label;
		let href = () => $.get($$item).href;
		var a_2 = root_2();
		var text_2 = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', href());
			$.set_text(text_2, label());
		});

		$.append($$anchor, a_2);
	});

	$.reset(div_2);
	$.reset(div);
	$.reset(footer);
	$.template_effect(($0) => $.set_attribute(a_1, 'href', $0), [() => resolve('/')]);
	$.append($$anchor, footer);
	$.pop();
}