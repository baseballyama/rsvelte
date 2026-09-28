import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CardsActivityGoal from "$lib/components/cards/activity-goal.svelte";
import CardsCalendar from "$lib/components/cards/calendar.svelte";
import CardsChat from "$lib/components/cards/chat.svelte";
import CardsCookieSettings from "$lib/components/cards/cookie-settings.svelte";
import CardsCreateAccount from "$lib/components/cards/create-account.svelte";
import CardsExerciseMinutes from "$lib/components/cards/exercise-minutes.svelte";
import CardsForms from "$lib/components/cards/forms.svelte";
import CardsPayments from "$lib/components/cards/payments.svelte";
import CardsReportIssue from "$lib/components/cards/report-issue.svelte";
import CardsShare from "$lib/components/cards/share.svelte";
import CardsStats from "$lib/components/cards/stats.svelte";
import CardsTeamMembers from "$lib/components/cards/team-members.svelte";

var root = $.from_html(`<div class="md:grids-col-2 grid **:data-[slot=card]:shadow-none md:gap-4 lg:grid-cols-10 xl:grid-cols-11" style="font-family: var(--font-geist)"><div class="grid gap-4 lg:col-span-4 xl:col-span-6"><!> <div class="grid gap-1 sm:grid-cols-[auto_1fr] md:hidden"><!> <div class="pt-3 sm:pt-0 sm:pl-2 xl:pl-4"><!></div> <div class="pt-3 sm:col-span-2 xl:pt-4"><!></div></div> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><div class="flex flex-col gap-4"><!> <!> <!></div> <div class="flex flex-col gap-4"><!> <!> <div class="hidden xl:block"><!></div></div></div></div> <div class="flex flex-col gap-4 lg:col-span-6 xl:col-span-5"><div class="hidden gap-1 sm:grid-cols-[auto_1fr] md:grid"><!> <div class="pt-3 sm:pt-0 sm:pl-2 xl:pl-3"><!></div> <div class="pt-3 sm:col-span-2 xl:pt-3"><!></div></div> <div class="hidden md:block"><!></div> <!> <div class="xl:hidden"><!></div></div></div>`);

export default function Cards_demo($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	CardsStats(node, {});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	CardsCalendar(node_1, {});

	var div_3 = $.sibling(node_1, 2);
	var node_2 = $.child(div_3);

	CardsActivityGoal(node_2, {});
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	CardsExerciseMinutes(node_3, {});
	$.reset(div_4);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.child(div_5);
	var node_4 = $.child(div_6);

	CardsForms(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	CardsTeamMembers(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	CardsCookieSettings(node_6, {});
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_7 = $.child(div_7);

	CardsCreateAccount(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	CardsChat(node_8, {});

	var div_8 = $.sibling(node_8, 2);
	var node_9 = $.child(div_8);

	CardsReportIssue(node_9, {});
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_1);

	var div_9 = $.sibling(div_1, 2);
	var div_10 = $.child(div_9);
	var node_10 = $.child(div_10);

	CardsCalendar(node_10, {});

	var div_11 = $.sibling(node_10, 2);
	var node_11 = $.child(div_11);

	CardsActivityGoal(node_11, {});
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_12 = $.child(div_12);

	CardsExerciseMinutes(node_12, {});
	$.reset(div_12);
	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var node_13 = $.child(div_13);

	CardsPayments(node_13, {});
	$.reset(div_13);

	var node_14 = $.sibling(div_13, 2);

	CardsShare(node_14, {});

	var div_14 = $.sibling(node_14, 2);
	var node_15 = $.child(div_14);

	CardsReportIssue(node_15, {});
	$.reset(div_14);
	$.reset(div_9);
	$.reset(div);
	$.append($$anchor, div);
}