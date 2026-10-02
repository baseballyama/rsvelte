import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import DecorCorners from './decor-corners.svelte';
import DecorStripes from './decor-stripes.svelte';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'lead',
	'description',
	'trail',
	'class'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<li aria-hidden="true"><!></li>`);
var root_2 = $.from_html(`<span aria-current="page"> </span>`);
var root_3 = $.from_html(`<a class="opacity-60 hover:underline"> </a>`);
var root_4 = $.from_html(`<!> <li><!></li>`, 1);
var root_5 = $.from_html(`<nav aria-label="Breadcrumb"><ol class="flex items-center gap-2 text-sm"></ol></nav>`);
var root_6 = $.from_html(`<div class="space-y-2"><!></div>`);
var root_7 = $.from_html(`<div class="lg:self-end flex items-center gap-2"><!></div>`);
var root_8 = $.from_html(`<header><!> <div class="flex-1 space-y-1"><!> <h1 class="h1"> </h1> <!></div> <!></header>`);
var root_9 = $.from_html(`<!> <!>`, 1);

export default function Page_header($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);

	function formatLabel(segment) {
		return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	// Exclude leading paths such as `/content`
	const crumbExclusions = ['content'];

	const crumbs = $.derived(() => {
		const segments = page.url.pathname.split('/').filter((s) => s);
		const withHrefs = segments.map((segment, i) => ({ segment, href: '/' + segments.slice(0, i + 1).join('/') }));
		const visible = withHrefs.filter(({ segment }) => !crumbExclusions.includes(segment));

		return visible.map(({ segment, href }, i) => ({
			label: formatLabel(segment),
			href,
			current: i === visible.length - 1
		}));
	});

	const currentLabel = $.derived(() => $.get(crumbs).findLast((c) => c.current)?.label);
	var fragment = root_9();
	var node = $.first_child(fragment);

	DecorCorners(node, {
		corners: ['bl', 'br'],
		children: ($$anchor, $$slotProps) => {
			var header = root_8();
			var node_1 = $.child(header);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var node_2 = $.child(div);

					$.snippet(node_2, () => $$props.lead);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if ($$props.lead) $$render(consequent);
				});
			}

			var div_1 = $.sibling(node_1, 2);
			var node_3 = $.child(div_1);

			{
				var consequent_3 = ($$anchor) => {
					var nav = root_5();
					var ol = $.child(nav);

					$.each(ol, 23, () => $.get(crumbs), (crumb) => crumb.href, ($$anchor, crumb, i) => {
						var fragment_1 = root_4();
						var node_4 = $.first_child(fragment_1);

						{
							var consequent_1 = ($$anchor) => {
								var li = root_1();
								var node_5 = $.child(li);

								ChevronRightIcon(node_5, { class: 'opacity-50 size-elem-sm' });
								$.reset(li);
								$.append($$anchor, li);
							};

							$.if(node_4, ($$render) => {
								if ($.get(i) > 0) $$render(consequent_1);
							});
						}

						var li_1 = $.sibling(node_4, 2);
						var node_6 = $.child(li_1);

						{
							var consequent_2 = ($$anchor) => {
								var span = root_2();
								var text = $.only_child(span, true);

								$.template_effect(() => $.set_text(text, $.get(crumb).label));
								$.append($$anchor, span);
							};

							var alternate = ($$anchor) => {
								var a = root_3();
								var text_1 = $.only_child(a, true);

								$.template_effect(() => {
									$.set_attribute(a, 'href', $.get(crumb).href);
									$.set_text(text_1, $.get(crumb).label);
								});

								$.append($$anchor, a);
							};

							$.if(node_6, ($$render) => {
								if ($.get(crumb).current) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(li_1);
						$.append($$anchor, fragment_1);
					});

					$.reset(ol);
					$.reset(nav);
					$.append($$anchor, nav);
				};

				$.if(node_3, ($$render) => {
					if ($.get(crumbs).length > 1) $$render(consequent_3);
				});
			}

			var h1 = $.sibling(node_3, 2);
			var text_2 = $.only_child(h1, true);
			var node_7 = $.sibling(h1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_2 = root_6();
					var node_8 = $.child(div_2);

					$.snippet(node_8, () => $$props.description);
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_7, ($$render) => {
					if ($$props.description) $$render(consequent_4);
				});
			}

			$.reset(div_1);

			var node_9 = $.sibling(div_1, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_3 = root_7();
					var node_10 = $.child(div_3);

					$.snippet(node_10, () => $$props.trail);
					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				$.if(node_9, ($$render) => {
					if ($$props.trail) $$render(consequent_5);
				});
			}

			$.reset(header);

			$.template_effect(() => {
				$.set_class(header, 1, `container-cell border-b border-surface-200-800 flex flex-col lg:flex-row lg:items-center gap-4 ${$$props.class ?? ''}`);
				$.set_text(text_2, $$props.title ?? $.get(currentLabel));
			});

			$.append($$anchor, header);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node, 2);

	DecorStripes(node_11, { class: 'h-6' });
	$.append($$anchor, fragment);
	$.pop();
}