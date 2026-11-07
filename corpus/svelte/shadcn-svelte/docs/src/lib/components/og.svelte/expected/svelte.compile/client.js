import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex h-full w-full bg-black text-white" style="font-family: 'Inter Latin'"><div class="absolute inset-y-0 start-16 flex w-[1px] border border-dashed border-stone-700"></div> <div class="absolute inset-y-0 end-16 flex w-[1px] border border-dashed border-stone-700"></div> <div class="absolute inset-x-0 top-16 flex h-[1px] border border-stone-700"></div> <div class="absolute inset-x-0 bottom-16 flex h-[1px] border border-stone-700"></div> <div class="absolute end-24 bottom-24 flex flex-row text-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg></div> <div class="absolute inset-32 flex w-[896px] flex-col justify-center"><div class="flex flex-grow-1 flex-col justify-center text-[64px] leading-[1.1]" style="text-wrap: balance; font-weight: 600; letter-spacing: -0.04em;"> </div> <div class="flex-grow-1 text-[40px] leading-[1.5] text-stone-400" style="font-weight: 500; text-wrap: balance;"> </div></div></div>`);

export default function Og($$anchor, $$props) {
	var div = root();
	var div_1 = $.sibling($.child(div), 8);
	var svg = $.child(div_1);

	$.set_attribute(svg, 'width', 48);
	$.set_attribute(svg, 'height', 48);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var text = $.only_child(div_3, true);
	var div_4 = $.sibling(div_3, 2);
	var text_1 = $.only_child(div_4, true);

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
}