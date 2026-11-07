import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ActivateAgentDialog from "./cards/activate-agent-dialog.svelte";
import AnalyticsCard from "./cards/analytics-card.svelte";
import AnomalyAlert from "./cards/anomaly-alert.svelte";
import BarChartCard from "./cards/bar-chart-card.svelte";
import BookAppointment from "./cards/book-appointment.svelte";
import CodespacesCard from "./cards/codespaces-card.svelte";
import ContributionsActivity from "./cards/contributions-activity.svelte";
import Contributors from "./cards/contributors.svelte";
import EnvironmentVariables from "./cards/environment-variables.svelte";
import FeedbackForm from "./cards/feedback-form.svelte";
import FileUpload from "./cards/file-upload.svelte";
import GithubProfile from "./cards/github-profile.svelte";
import IconPreviewGrid from "./cards/icon-preview-grid.svelte";
import InviteTeam from "./cards/invite-team.svelte";
import Invoice from "./cards/invoice.svelte";
import LiveWaveformCard from "./cards/live-waveform.svelte";
import NoTeamMembers from "./cards/no-team-members.svelte";
import NotFound from "./cards/not-found.svelte";
import ObservabilityCard from "./cards/observability-card.svelte";
import PieChartCard from "./cards/pie-chart-card.svelte";
import ReportBug from "./cards/report-bug.svelte";
import ShippingAddress from "./cards/shipping-address.svelte";
import Shortcuts from "./cards/shortcuts.svelte";
import SkeletonLoading from "./cards/skeleton-loading.svelte";
import SleepReport from "./cards/sleep-report.svelte";
import StyleOverview from "./cards/style-overview.svelte";
import TypographySpecimen from "./cards/typography-specimen.svelte";
import UIElements from "./cards/ui-elements.svelte";
import UsageCard from "./cards/usage-card.svelte";
import Visitors from "./cards/visitors.svelte";
import WeeklyFitnessSummary from "./cards/weekly-fitness-summary.svelte";

var root = $.from_html(`<div class="overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)]"><div class="flex w-full min-w-max justify-center"><div class="grid w-[2400px] grid-cols-7 items-start gap-(--gap) bg-muted p-(--gap) md:w-[3000px] dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] *:[div]:gap-(--gap)" data-slot="capture-target"><div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <div class="md:hidden"><!></div> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <div class="hidden w-full md:flex"><!></div> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div> <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]"><!> <!> <!> <!> <!></div></div></div></div>`);

export default function Preview($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	StyleOverview(node, {});

	var node_1 = $.sibling(node, 2);

	TypographySpecimen(node_1, {});

	var div_4 = $.sibling(node_1, 2);
	var node_2 = $.child(div_4);

	UIElements(node_2, {});
	$.reset(div_4);

	var node_3 = $.sibling(div_4, 2);

	CodespacesCard(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Invoice(node_4, {});
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var node_5 = $.child(div_5);

	IconPreviewGrid(node_5, {});

	var div_6 = $.sibling(node_5, 2);
	var node_6 = $.child(div_6);

	UIElements(node_6, {});
	$.reset(div_6);

	var node_7 = $.sibling(div_6, 2);

	ObservabilityCard(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	ShippingAddress(node_8, {});
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_9 = $.child(div_7);

	EnvironmentVariables(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	BarChartCard(node_10, {});

	var node_11 = $.sibling(node_10, 2);

	InviteTeam(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	ActivateAgentDialog(node_12, {});
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_13 = $.child(div_8);

	SkeletonLoading(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	PieChartCard(node_14, {});

	var node_15 = $.sibling(node_14, 2);

	NoTeamMembers(node_15, {});

	var node_16 = $.sibling(node_15, 2);

	ReportBug(node_16, {});

	var node_17 = $.sibling(node_16, 2);

	Contributors(node_17, {});
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_18 = $.child(div_9);

	FeedbackForm(node_18, {});

	var node_19 = $.sibling(node_18, 2);

	BookAppointment(node_19, {});

	var node_20 = $.sibling(node_19, 2);

	SleepReport(node_20, {});

	var node_21 = $.sibling(node_20, 2);

	GithubProfile(node_21, {});
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_22 = $.child(div_10);

	WeeklyFitnessSummary(node_22, {});

	var node_23 = $.sibling(node_22, 2);

	FileUpload(node_23, {});

	var node_24 = $.sibling(node_23, 2);

	AnalyticsCard(node_24, {});

	var node_25 = $.sibling(node_24, 2);

	UsageCard(node_25, {});

	var node_26 = $.sibling(node_25, 2);

	Shortcuts(node_26, {});
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_27 = $.child(div_11);

	AnomalyAlert(node_27, {});

	var node_28 = $.sibling(node_27, 2);

	LiveWaveformCard(node_28, {});

	var node_29 = $.sibling(node_28, 2);

	Visitors(node_29, {});

	var node_30 = $.sibling(node_29, 2);

	ContributionsActivity(node_30, {});

	var node_31 = $.sibling(node_30, 2);

	NotFound(node_31, {});
	$.reset(div_11);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}