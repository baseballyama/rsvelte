import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Zap from "@lucide/svelte/icons/zap";
import Activity from "@lucide/svelte/icons/activity";
import DraftingCompass from "@lucide/svelte/icons/drafting-compass";
import Mail from "@lucide/svelte/icons/mail";

var root = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-6xl px-6"><div class="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24"><div class="lg:col-span-2"><div class="md:pr-6 lg:pr-0"><h2 class="text-4xl font-semibold lg:text-5xl">Built for Scaling teams</h2> <p class="mt-6">Orrupti aut temporibus assumenda atque ab, accusamus sit, molestiae veniam
						laboriosam pariatur.</p></div> <ul class="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3"><li><!> Email and web support</li> <li><!> Fast response time</li> <li><!> Menitoring and analytics</li> <li><!> Architectural review</li></ul></div> <div class="relative rounded-3xl border border-border/50 p-3 lg:col-span-3"><div class="relative aspect-76/59 rounded-2xl bg-linear-to-b from-zinc-300 to-transparent p-px dark:from-zinc-700"><img src="/payments.png" class="hidden rounded-[15px] dark:block" alt="payments illustration dark"/> <img src="/payments-light.png" class="rounded-[15px] shadow dark:hidden" alt="payments illustration light"/></div></div></div></div></section>`);

export default function Feature_five($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var ul = $.sibling($.child(div_2), 2);
	var li = $.child(ul);
	var node = $.child(li);

	Mail(node, { class: 'size-5' });
	$.next();
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_1 = $.child(li_1);

	Zap(node_1, { class: 'size-5' });
	$.next();
	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var node_2 = $.child(li_2);

	Activity(node_2, { class: 'size-5' });
	$.next();
	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var node_3 = $.child(li_3);

	DraftingCompass(node_3, { class: 'size-5' });
	$.next();
	$.reset(li_3);
	$.reset(ul);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var img = $.child(div_4);

	$.set_attribute(img, 'width', 1207);
	$.set_attribute(img, 'height', 929);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 1207);
	$.set_attribute(img_1, 'height', 929);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}