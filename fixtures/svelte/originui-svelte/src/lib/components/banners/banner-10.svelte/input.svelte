<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import TicketPercent from '@lucide/svelte/icons/ticket-percent';
	import X from '@lucide/svelte/icons/x';

	// Setting 9h 45m 24s from now for demo purposes
	const saleEndDate = new Date(Date.now() + 9 * 60 * 60 * 1000 + 45 * 60 * 1000 + 24 * 1000);

	let visible = $state(true);
	let timeLeft = $state(calculateTimeLeft());

	function calculateTimeLeft() {
		const difference = saleEndDate.getTime() - new Date().getTime();

		if (difference <= 0) return { days: 0, hours: 0, isExpired: true, minutes: 0, seconds: 0 };

		return {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			isExpired: false,
			minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((difference % (1000 * 60)) / 1000)
		};
	}

	$effect(() => {
		const timer = setInterval(() => {
			timeLeft = calculateTimeLeft();
			if (timeLeft.isExpired) {
				clearInterval(timer);
			}
		}, 1000);

		return () => clearInterval(timer);
	});
</script>

{#if visible && !timeLeft.isExpired}
	<div class="dark bg-muted text-foreground px-4 py-3">
		<div class="flex gap-2 md:items-center">
			<div class="flex grow gap-3 md:items-center">
				<div
					class="bg-primary/15 flex size-9 shrink-0 items-center justify-center rounded-full max-md:mt-0.5"
					aria-hidden="true"
				>
					<TicketPercent class="opacity-80" size={16} />
				</div>
				<div class="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
					<div class="space-y-0.5">
						<p class="text-sm font-medium">Black Friday Sale!</p>
						<p class="text-muted-foreground text-sm">
							It kicks off today and is available for just 24 hours—don&lsquo;t miss out!
						</p>
					</div>
					<div class="flex gap-3 max-md:flex-wrap">
						<div
							class="divide-primary-foreground bg-primary/15 flex items-center divide-x rounded-lg text-sm tabular-nums"
						>
							{#if timeLeft.days > 0}
								<span class="flex h-8 items-center justify-center p-2">
									{timeLeft.days}
									<span class="text-muted-foreground">d</span>
								</span>
							{/if}

							<span class="flex h-8 items-center justify-center p-2">
								{timeLeft.hours.toString().padStart(2, '0')}
								<span class="text-muted-foreground">h</span>
							</span>
							<span class="flex h-8 items-center justify-center p-2">
								{timeLeft.minutes.toString().padStart(2, '0')}
								<span class="text-muted-foreground">m</span>
							</span>
							<span class="flex h-8 items-center justify-center p-2">
								{timeLeft.seconds.toString().padStart(2, '0')}
								<span class="text-muted-foreground">s</span>
							</span>
						</div>
						<Button size="sm" class="text-sm">Buy now</Button>
					</div>
				</div>
			</div>
			<Button
				variant="ghost"
				class="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
				onclick={() => (visible = false)}
				aria-label="Close banner"
			>
				<X
					size={16}
					class="opacity-60 transition-opacity group-hover:opacity-100"
					aria-hidden="true"
				/>
			</Button>
		</div>
	</div>
{/if}
