import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RainbowButton from "$lib/components/magic/RainbowButton.svelte";
import Button from "$lib/components/ui/button/button.svelte";
import Separator from "$lib/components/ui/separator/separator.svelte";
import GridPattern from "$lib/components/magic/GridPattern.svelte";
import { cn } from "$lib/utils";

var root = $.from_html(`<meta name="description" content="The Ultimate Landing Page for your Startup. This is a landing page template for a SaaS product. The template is built with Svelte 5, TailwindCSS V4, and Shadcn Svelte."/>`);
var root_1 = $.from_html(`<span class="flex items-start font-semibold text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1.5 mr-2 h-4 w-4 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg> </span>`);

var root_2 = $.from_html(`<div class="relative mx-auto mb-16 max-w-7xl overflow-hidden rounded-b-2xl border-x border-b px-4 pt-2 sm:pt-16 md:px-8 md:pt-4"><!> <h1 class="mt-4 mb-2 text-3xl font-bold capitalize">Startup Template</h1> <p class="text-md text-muted-foreground md:text-lg">The Ultimate Landing Page for your Startup.</p> <div class="mt-4 h-fit w-full md:h-fit md:max-w-4xl"><img src="/landing-page.png" alt="landing page" class="h-fit rounded-2xl border border-zinc-700/20 object-cover object-top shadow-md dark:shadow-zinc-950"/></div> <div class="my-8 flex w-full items-center gap-3"><!> <!></div> <!> <div class="z-40 my-6 max-w-7xl space-y-3 bg-background"><div class="grid grid-cols-1 py-4 sm:grid-cols-9 sm:space-x-10"><div class="col-span-3 lg:col-span-2"><h2 class="text-xl font-bold sm:text-3xl">What is this?</h2></div> <div class="col-span-6"><p class="text-md text-muted-foreground sm:text-lg">This is a landing page template for a SaaS product. The template is built with
					Svelte 5, TailwindCSS V4, and Shadcn Svelte.</p></div></div> <!> <div class="grid grid-cols-1 py-4 sm:space-x-10 md:grid-cols-9"><div class="col-span-3 lg:col-span-2"><h2 class="text-xl font-bold sm:text-3xl">Who is this for?</h2></div> <div class="col-span-6"><p class="text-md text-muted-foreground sm:text-lg">This template is perfect for startups, small businesses, and entrepreneurs
					looking to create a professional landing page for their SaaS product.</p></div></div> <!> <div class="grid grid-cols-1 py-4 sm:space-x-10 md:grid-cols-9"><div class="col-span-3 lg:col-span-2"><h2 class="text-xl font-bold sm:text-3xl">What's included?</h2></div> <div class="col-span-6"><p class="text-md text-muted-foreground sm:text-lg">This template is specifically designed for landing pages, packed with essential
					features and components to streamline your development process. It helps you
					create stunning, high-converting landing page in a fraction of the time,
					allowing you to focus on what matters most - your product.</p> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div><h3 class="mt-4 text-2xl font-semibold text-primary">Features</h3> <div class="text-md mt-4 flex list-inside list-disc flex-col space-y-1 text-muted-foreground"></div></div> <div><h3 class="mt-4 text-2xl font-semibold text-primary">Page Sections</h3> <div class="text-md mt-4 flex list-inside list-disc flex-col space-y-1 text-muted-foreground"></div></div></div></div></div> <!> <div class="grid grid-cols-1 gap-6 py-4 md:grid-cols-9"><div class="col-span-3 lg:col-span-2"><h2 class="text-xl font-bold sm:text-3xl">How to use?</h2></div> <div class="col-span-6"><p class="text-md text-muted-foreground sm:text-lg">To get started, simply click the "Get Access" button above to purchase the
					template. Once you've purchased the template, you'll receive an email with a
					link to the Github repository. You can then clone the repository and start
					customizing the template to fit your needs.</p></div></div> <!> <div class="grid grid-cols-1 gap-6 py-4 md:grid-cols-9"><div class="col-span-3 lg:col-span-2"><h2 class="text-xl font-bold sm:text-3xl">Tech Stack</h2></div> <div class="col-span-6"><div><div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>Sveltekit <span class="ml-2 text-muted-foreground">v2</span></div> <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>TailwindCSS <span class="ml-2 text-muted-foreground">v4</span></div> <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>Shadcn Svelte</div> <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>Svelte Animations</div></div></div></div></div></div> <section class="pb-10"><div class="mx-auto max-w-5xl rounded-3xl border bg-background px-6 py-12 md:py-20 lg:py-20"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Startup Template</h2> <p class="mt-4 text-muted-foreground">The Ultimate Landing Page for your Startup.</p> <div class="mt-12 flex flex-wrap justify-center gap-4"><!></div></div></div></section></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let features = [
		"Save 100+ hours of work",
		"1x Landing Page with 10+ sections",
		"Dark mode support",
		"100% Mobile responsive",
		"SEO Optimized",
		"Scroll Animations & Micro Interactions",
		"Global config for text, images and more",
		"Get Github Repo Access",
		"Deploy live to vercel"
	];

	let sections = [
		"Header",
		"Hero",
		"Logos",
		"Problem",
		"Bento Features",
		"Features",
		"Testimonial",
		"Pricing",
		"Faq",
		"CTA",
		"Footer"
	];

	var div = root_2();

	$.head('12pq51', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Startup Template - The Ultimate Landing Page for your Startup';
		});

		$.append($$anchor, meta);
	});

	var node = $.child(div);

	{
		let $0 = $.derived(() => cn("[mask-image:radial-gradient(800px_circle_at_top_right,white,transparent)]", "-z-40"));

		GridPattern(node, {
			width: 30,
			height: 30,
			strokeDashArray: '4 2',
			x: -10,
			get class() {
				return $.get($0);
			}
		});
	}

	var div_1 = $.sibling(node, 8);
	var node_1 = $.child(div_1);

	Button(node_1, {
		target: '_blank',
		href: 'https://buy.polar.sh/polar_cl_AjEE4uRd34lOYFgOsLlGXCtyHfPqrwL6rXx5G3qPNAi',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Buy Now');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		href: 'https://sv-landing-pg.vercel.app',
		target: '_blank',
		variant: 'outline',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Live Demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	Separator(node_3, {});

	var div_2 = $.sibling(node_3, 2);
	var node_4 = $.sibling($.child(div_2), 2);

	Separator(node_4, {});

	var node_5 = $.sibling(node_4, 4);

	Separator(node_5, {});

	var div_3 = $.sibling(node_5, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var div_6 = $.child(div_5);
	var div_7 = $.sibling($.child(div_6), 2);

	$.each(div_7, 21, () => features, $.index, ($$anchor, feature) => {
		var span = root_1();
		var text_2 = $.sibling($.child(span), 1, true);

		$.reset(span);
		$.template_effect(() => $.set_text(text_2, $.get(feature)));
		$.append($$anchor, span);
	});

	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.sibling($.child(div_8), 2);

	$.each(div_9, 21, () => sections, $.index, ($$anchor, section) => {
		var span_1 = root_1();
		var text_3 = $.sibling($.child(span_1), 1, true);

		$.reset(span_1);
		$.template_effect(() => $.set_text(text_3, $.get(section)));
		$.append($$anchor, span_1);
	});

	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_6 = $.sibling(div_3, 2);

	Separator(node_6, {});

	var node_7 = $.sibling(node_6, 4);

	Separator(node_7, {});
	$.next(2);
	$.reset(div_2);

	var section_1 = $.sibling(div_2, 2);
	var div_10 = $.child(section_1);
	var div_11 = $.child(div_10);
	var div_12 = $.sibling($.child(div_11), 4);
	var node_8 = $.child(div_12);

	Button(node_8, {
		size: 'lg',
		href: 'https://buy.polar.sh/polar_cl_AjEE4uRd34lOYFgOsLlGXCtyHfPqrwL6rXx5G3qPNAi',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Buy Now');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_10);
	$.reset(section_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}