import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AccountAccess from "./cards/account-access.svelte";
import CardOverview from "./cards/card-overview.svelte";
import ClaimableBalance from "./cards/claimable-balance.svelte";
import ContributionHistory from "./cards/contribution-history.svelte";
import CoverArt from "./cards/cover-art.svelte";
import DividendIncome from "./cards/dividend-income.svelte";
import EmptyConnectBank from "./cards/empty-connect-bank.svelte";
import EmptyDistributeTrack from "./cards/empty-distribute-track.svelte";
import EmptyExploreCatalog from "./cards/empty-explore-catalog.svelte";
import Faq from "./cards/faq.svelte";
import FrontDoor from "./cards/front-door.svelte";
import IndexInvesting from "./cards/index-investing.svelte";
import KitchenIsland from "./cards/kitchen-island.svelte";
import LoadingCard from "./cards/loading-card.svelte";
import NewMilestone from "./cards/new-milestone.svelte";
import NotificationSettings from "./cards/notification-settings.svelte";
import Payments from "./cards/payments.svelte";
import PayoutThreshold from "./cards/payout-threshold.svelte";
import PowerUsage from "./cards/power-usage.svelte";
import Preferences from "./cards/preferences.svelte";
import QrConnect from "./cards/qr-connect.svelte";
import ReceivingMethod from "./cards/receiving-method.svelte";
import RecentTransactions from "./cards/recent-transactions.svelte";
import ReleaseCatalog from "./cards/release-catalog.svelte";
import RollerShades from "./cards/roller-shades.svelte";
import SavingsProgress from "./cards/savings-progress.svelte";
import SavingsTargets from "./cards/savings-targets.svelte";
import SidebarNav from "./cards/sidebar-nav.svelte";
import SocialLinks from "./cards/social-links.svelte";
import StockPerformance from "./cards/stock-performance.svelte";
import SyncingState from "./cards/syncing-state.svelte";
import TransferFunds from "./cards/transfer-funds.svelte";
import UpcomingPayments from "./cards/upcoming-payments.svelte";

var root = $.from_html(`<div class="overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)]"><div class="flex w-full min-w-max justify-center"><div class="grid w-[2400px] grid-cols-7 items-start gap-(--gap) bg-muted p-(--gap) md:w-[3000px] dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] *:[div]:gap-(--gap)" data-slot="capture-target"><div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div> <div class="col-span-2 flex flex-col p-1 [contain-intrinsic-size:760px_1200px] [content-visibility:auto]"><!> <!> <div class="grid grid-cols-2 items-start gap-(--gap)"><div class="flex flex-col gap-(--gap)"><!> <!></div> <div class="flex flex-col gap-(--gap)"><!> <!></div></div> <!></div> <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div> <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div> <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div></div></div></div>`);

export default function Preview_02($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	ContributionHistory(node, {});

	var node_1 = $.sibling(node, 2);

	EmptyDistributeTrack(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	QrConnect(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	DividendIncome(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	IndexInvesting(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	SyncingState(node_5, {});
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_6 = $.child(div_4);

	PayoutThreshold(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	ClaimableBalance(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	Preferences(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	SavingsProgress(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	KitchenIsland(node_10, {});
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_11 = $.child(div_5);

	SavingsTargets(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	RecentTransactions(node_12, {});

	var div_6 = $.sibling(node_12, 2);
	var div_7 = $.child(div_6);
	var node_13 = $.child(div_7);

	SidebarNav(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	Faq(node_14, {});
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_15 = $.child(div_8);

	Payments(node_15, {});

	var node_16 = $.sibling(node_15, 2);

	FrontDoor(node_16, {});
	$.reset(div_8);
	$.reset(div_6);

	var node_17 = $.sibling(div_6, 2);

	ReleaseCatalog(node_17, {});
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var node_18 = $.child(div_9);

	AccountAccess(node_18, {});

	var node_19 = $.sibling(node_18, 2);

	CardOverview(node_19, {});

	var node_20 = $.sibling(node_19, 2);

	TransferFunds(node_20, {});

	var node_21 = $.sibling(node_20, 2);

	CoverArt(node_21, {});

	var node_22 = $.sibling(node_21, 2);

	LoadingCard(node_22, {});
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_23 = $.child(div_10);

	ReceivingMethod(node_23, {});

	var node_24 = $.sibling(node_23, 2);

	PowerUsage(node_24, {});

	var node_25 = $.sibling(node_24, 2);

	EmptyConnectBank(node_25, {});

	var node_26 = $.sibling(node_25, 2);

	UpcomingPayments(node_26, {});

	var node_27 = $.sibling(node_26, 2);

	RollerShades(node_27, {});
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_28 = $.child(div_11);

	StockPerformance(node_28, {});

	var node_29 = $.sibling(node_28, 2);

	EmptyExploreCatalog(node_29, {});

	var node_30 = $.sibling(node_29, 2);

	NewMilestone(node_30, {});

	var node_31 = $.sibling(node_30, 2);

	SocialLinks(node_31, {});

	var node_32 = $.sibling(node_31, 2);

	NotificationSettings(node_32, {});
	$.reset(div_11);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}