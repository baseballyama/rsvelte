import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapIcon from "@lucide/svelte/icons/map";
import MessageCircle from "@lucide/svelte/icons/message-circle";
import DottedMap from "dotted-map";
import { onMount } from "svelte";

var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg"></svg>`);

var root_2 = $.from_html(`<section class="px-4 py-16 md:py-32"><div class="mx-auto grid max-w-5xl border md:grid-cols-2"><div><div class="p-6 sm:p-12"><span class="flex items-center gap-2 text-muted-foreground"><!> Real time location tracking</span> <p class="mt-8 text-2xl font-semibold">Advanced tracking system, Instantly locate all your assets.</p></div> <div class="relative"><div class="absolute inset-0 z-10 m-auto size-fit"><div class="relative z-1 flex size-fit w-fit items-center gap-2 rounded-(--radius) border bg-background px-3 py-1 text-xs font-medium shadow-md shadow-zinc-950/5 dark:bg-muted"><span class="text-lg">🇨🇩</span> Last connection from DR Congo</div> <div class="absolute inset-2 -bottom-2 mx-auto rounded-(--radius) border bg-background px-3 py-4 text-xs font-medium shadow-md shadow-zinc-950/5 dark:bg-zinc-900"></div></div> <div class="relative overflow-hidden"><div class="absolute inset-0 z-1 bg-radial from-transparent to-background to-75%"></div> <!></div></div></div> <div class="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent"><div class="relative z-10"><span class="flex items-center gap-2 text-muted-foreground"><!> Email and web support</span> <p class="my-8 text-2xl font-semibold">Reach out via email or web for any assistance you need.</p></div> <div class="flex flex-col gap-8"><div><div class="flex items-center gap-2"><span class="flex size-5 rounded-full border"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" role="img" class="m-auto size-3" color="currentColor"><path d="M22 18C22 19.4001 22 20.1002 21.7275 20.635C21.4878 21.1054 21.1054 21.4878 20.635 21.7275C20.1002 22 19.4001 22 18 22C16.5999 22 15.8998 22 15.365 21.7275C14.8946 21.4878 14.5122 21.1054 14.2725 20.635C14 20.1002 14 19.4001 14 18C14 16.5999 14 15.8998 14.2725 15.365C14.5122 14.8946 14.8946 14.5122 15.365 14.2725C15.8998 14 16.5999 14 18 14C19.4001 14 20.1002 14 20.635 14.2725C21.1054 14.5122 21.4878 14.8946 21.7275 15.365C22 15.8998 22 16.5999 22 18Z" stroke="currentColor" stroke-width="1.5"></path><path d="M22 10C22 11.4001 22 12.1002 21.7275 12.635C21.4878 13.1054 21.1054 13.4878 20.635 13.7275C20.1002 14 19.4001 14 18 14C16.5999 14 15.8998 14 15.365 13.7275C14.8946 13.4878 14.5122 13.1054 14.2725 12.635C14 12.1002 14 11.4001 14 10C14 8.59987 14 7.8998 14.2725 7.36502C14.5122 6.89462 14.8946 6.51217 15.365 6.27248C15.8998 6 16.5999 6 18 6C19.4001 6 20.1002 6 20.635 6.27248C21.1054 6.51217 21.4878 6.89462 21.7275 7.36502C22 7.8998 22 8.59987 22 10Z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 18C14 19.4001 14 20.1002 13.7275 20.635C13.4878 21.1054 13.1054 21.4878 12.635 21.7275C12.1002 22 11.4001 22 10 22C8.59987 22 7.8998 22 7.36502 21.7275C6.89462 21.4878 6.51217 21.1054 6.27248 20.635C6 20.1002 6 19.4001 6 18C6 16.5999 6 15.8998 6.27248 15.365C6.51217 14.8946 6.89462 14.5122 7.36502 14.2725C7.8998 14 8.59987 14 10 14C11.4001 14 12.1002 14 12.635 14.2725C13.1054 14.5122 13.4878 14.8946 13.7275 15.365C14 15.8998 14 16.5999 14 18Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M10 6C10 7.40013 10 8.1002 9.72752 8.63497C9.48783 9.10538 9.10538 9.48783 8.63498 9.72752C8.1002 10 7.40013 10 6 10C4.59987 10 3.8998 10 3.36502 9.72751C2.89462 9.48783 2.51217 9.10538 2.27248 8.63497C2 8.10019 2 7.40013 2 6C2 4.59987 2 3.8998 2.27248 3.36502C2.51217 2.89462 2.89462 2.51217 3.36502 2.27248C3.8998 2 4.59987 2 6 2C7.40013 2 8.1002 2 8.63498 2.27248C9.10538 2.51217 9.48783 2.89462 9.72752 3.36502C10 3.8998 10 4.59987 10 6Z" stroke="currentColor" stroke-width="1.5"></path></svg></span> <span class="text-xs text-muted-foreground">Sat 22 Feb</span></div> <div class="mt-1.5 w-3/5 rounded-(--radius) border bg-background p-3 text-xs">Hey, I'm having trouble with my account.</div></div> <div><div class="mb-1 ml-auto w-3/5 rounded-(--radius) bg-blue-600 p-3 text-xs text-white">Molestiae numquam debitis et ullam distinctio provident nobis repudiandae
						deleniti necessitatibus.</div> <span class="block text-right text-xs text-muted-foreground">Now</span></div></div></div></div></section>`);

export default function Feature_nine($$anchor, $$props) {
	$.push($$props, true);

	const Map = ($$anchor) => {
		const viewBox = $.derived(() => "0 0 120 60");
		var svg = root_1();

		$.set_attribute(svg, 'viewBox', $.get(viewBox));

		$.each(svg, 21, () => $.get(points), $.index, ($$anchor, point) => {
			var circle = root();

			$.template_effect(() => {
				$.set_attribute(circle, 'cx', $.get(point).x);
				$.set_attribute(circle, 'cy', $.get(point).y);
				$.set_attribute(circle, 'r', svgOptions.radius);
				$.set_attribute(circle, 'fill', svgOptions.color);
			});

			$.append($$anchor, circle);
		});

		$.reset(svg);
		$.template_effect(() => $.set_style(svg, `background-color: ${svgOptions.backgroundColor ?? ''};`));
		$.append($$anchor, svg);
	};

	let map = $.state(void 0);
	let points = $.state($.proxy([]));

	onMount(() => {
		$.set(map, new DottedMap({ height: 55, grid: "diagonal" }), true);
		$.set(points, $.get(map).getPoints(), true);
	});

	let svgOptions = {
		backgroundColor: "var(--color-background)",
		color: "currentColor",
		radius: 0.15
	};

	var section = root_2();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var span = $.child(div_2);
	var node = $.child(span);

	MapIcon(node, { class: 'size-4' });
	$.next();
	$.reset(span);
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_1 = $.sibling($.child(div_4), 2);

	Map(node_1);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.child(div_5);
	var span_1 = $.child(div_6);
	var node_2 = $.child(span_1);

	MessageCircle(node_2, { class: 'size-4' });
	$.next();
	$.reset(span_1);
	$.next(2);
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}