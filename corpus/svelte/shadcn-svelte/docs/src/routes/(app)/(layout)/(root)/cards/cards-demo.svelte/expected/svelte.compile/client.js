import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AccountAccess from "./account-access.svelte";
import AnalyticsCard from "./analytics-card.svelte";
import ClaimableBalance from "./claimable-balance.svelte";
import ContributionHistory from "./contribution-history.svelte";
import DividendIncome from "./dividend-income.svelte";
import EmptyDistributeTrack from "./empty-distribute-track.svelte";
import NewMilestone from "./new-milestone.svelte";
import NotificationSettings from "./notification-settings.svelte";
import Payments from "./payments.svelte";
import PayoutThreshold from "./payout-threshold.svelte";
import PowerUsage from "./power-usage.svelte";
import QrConnect from "./qr-connect.svelte";
import SavingsTargets from "./savings-targets.svelte";
import SidebarNav from "./sidebar-nav.svelte";
import SkeletonAccountAccess from "./skeleton/account-access.svelte";
import SkeletonAnalyticsCard from "./skeleton/analytics-card.svelte";
import SkeletonClaimableBalance from "./skeleton/claimable-balance.svelte";
import SkeletonContributionHistory from "./skeleton/contribution-history.svelte";
import SkeletonDividendIncome from "./skeleton/dividend-income.svelte";
import SkeletonEmptyDistributeTrack from "./skeleton/empty-distribute-track.svelte";
import SkeletonNewMilestone from "./skeleton/new-milestone.svelte";
import SkeletonNotificationSettings from "./skeleton/notification-settings.svelte";
import SkeletonPayments from "./skeleton/payments.svelte";
import SkeletonPayoutThreshold from "./skeleton/payout-threshold.svelte";
import SkeletonPowerUsage from "./skeleton/power-usage.svelte";
import SkeletonQrConnect from "./skeleton/qr-connect.svelte";
import SkeletonSavingsTargets from "./skeleton/savings-targets.svelte";
import SkeletonTransferFunds from "./skeleton/transfer-funds.svelte";
import SkeletonUIElements from "./skeleton/ui-elements.svelte";
import TransferFunds from "./transfer-funds.svelte";
import UIElements from "./ui-elements.svelte";

const CardsSkeletonRails = ($$anchor) => {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	SkeletonContributionHistory(node, {});

	var node_1 = $.sibling(node, 2);

	SkeletonClaimableBalance(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	SkeletonDividendIncome(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	SkeletonPayoutThreshold(node_3, {});
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	SkeletonUIElements(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	SkeletonSavingsTargets(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	SkeletonNewMilestone(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	SkeletonPayoutThreshold(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	SkeletonAccountAccess(node_8, {});
	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var node_9 = $.child(div_5);

	SkeletonNewMilestone(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	SkeletonPayoutThreshold(node_10, {});

	var node_11 = $.sibling(node_10, 2);

	SkeletonAccountAccess(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	SkeletonQrConnect(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	SkeletonTransferFunds(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	SkeletonPayments(node_14, {});

	var node_15 = $.sibling(node_14, 2);

	SkeletonEmptyDistributeTrack(node_15, {});
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_16 = $.child(div_6);

	SkeletonQrConnect(node_16, {});

	var node_17 = $.sibling(node_16, 2);

	SkeletonTransferFunds(node_17, {});

	var node_18 = $.sibling(node_17, 2);

	SkeletonPayments(node_18, {});

	var node_19 = $.sibling(node_18, 2);

	SkeletonEmptyDistributeTrack(node_19, {});

	var node_20 = $.sibling(node_19, 2);

	SkeletonAnalyticsCard(node_20, {});

	var node_21 = $.sibling(node_20, 2);

	SkeletonNotificationSettings(node_21, {});

	var node_22 = $.sibling(node_21, 2);

	SkeletonPowerUsage(node_22, {});
	$.reset(div_6);
	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
};

var root = $.from_html(`<div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-12 z-10 hidden min-[2200px]:block [&amp;_[data-slot=skeleton]:nth-child(even)]:hidden"><div class="absolute top-0 left-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]"><div class="flex flex-col gap-(--gap)"><!> <!> <!> <!></div> <div class="flex flex-col gap-(--gap)"><!> <!> <!> <!> <!></div></div> <div class="absolute top-0 right-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]"><div class="flex flex-col gap-(--gap)"><!> <!> <!> <!> <!> <!> <!></div> <div class="flex flex-col gap-(--gap)"><!> <!> <!> <!> <!> <!> <!></div></div></div>`);
var root_1 = $.from_html(`<div data-slot="demo" class="theme-neutral relative flex w-full max-w-none flex-col gap-(--gap) overflow-hidden bg-muted p-12 pb-0! [--gap:--spacing(8)] 3xl:[--gap:--spacing(8)] min-[1900px]:p-12 min-[1900px]:[--gap:--spacing(10)]! lg:p-6 lg:[--gap:--spacing(6)] dark:bg-background"><!> <div class="relative z-10 mx-auto grid gap-(--gap) **:data-[slot=card]:w-full min-[1400px]:grid-cols-4! min-[1900px]:grid-cols-5! md:max-w-3xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3 xl:max-w-[1600px] 2xl:max-w-[1900px]"><div class="flex flex-col items-start gap-(--gap)"><!> <!> <!></div> <div class="hidden flex-col gap-(--gap) lg:flex"><!> <!> <!></div> <div class="hidden flex-col gap-(--gap) 3xl:flex!"><!> <!> <!></div> <div class="hidden flex-col gap-(--gap) md:flex"><!> <!> <!></div> <div class="hidden flex-col gap-(--gap) min-[1400px]:flex"><!> <!> <!> <!></div></div> <div class="absolute inset-x-0 top-0 z-[1] h-120 bg-linear-to-b from-background via-muted to-transparent dark:hidden"></div> <div class="absolute inset-x-0 bottom-0 z-20 h-48 bg-linear-to-t from-background via-muted/80 to-transparent lg:h-80 xl:h-64 dark:via-background/80"></div></div>`);

export default function Cards_demo($$anchor) {
	var div_7 = root_1();
	var node_23 = $.child(div_7);

	CardsSkeletonRails(node_23);

	var div_8 = $.sibling(node_23, 2);
	var div_9 = $.child(div_8);
	var node_24 = $.child(div_9);

	UIElements(node_24, {});

	var node_25 = $.sibling(node_24, 2);

	SidebarNav(node_25, {});

	var node_26 = $.sibling(node_25, 2);

	SavingsTargets(node_26, {});
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_27 = $.child(div_10);

	ContributionHistory(node_27, {});

	var node_28 = $.sibling(node_27, 2);

	ClaimableBalance(node_28, {});

	var node_29 = $.sibling(node_28, 2);

	DividendIncome(node_29, {});
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_30 = $.child(div_11);

	NewMilestone(node_30, {});

	var node_31 = $.sibling(node_30, 2);

	PayoutThreshold(node_31, {});

	var node_32 = $.sibling(node_31, 2);

	AccountAccess(node_32, {});
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_33 = $.child(div_12);

	QrConnect(node_33, {});

	var node_34 = $.sibling(node_33, 2);

	TransferFunds(node_34, {});

	var node_35 = $.sibling(node_34, 2);

	Payments(node_35, {});
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_36 = $.child(div_13);

	EmptyDistributeTrack(node_36, {});

	var node_37 = $.sibling(node_36, 2);

	AnalyticsCard(node_37, {});

	var node_38 = $.sibling(node_37, 2);

	NotificationSettings(node_38, {});

	var node_39 = $.sibling(node_38, 2);

	PowerUsage(node_39, {});
	$.reset(div_13);
	$.reset(div_8);
	$.next(4);
	$.reset(div_7);
	$.append($$anchor, div_7);
}