<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import X from '@lucide/svelte/icons/x';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

	const items = [
		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '115' },
				{ name: 'Edge', supported: true, version: '115' },
				{ name: 'Firefox', supported: false, version: '111' },
				{ name: 'Opera', supported: true, version: '101' },
				{ name: 'Safari', supported: false, version: 'No' }
			],
			feature: 'scroll-timeline',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '115' },
				{ name: 'Firefox Android', supported: false, version: 'No' },
				{ name: 'Opera Android', supported: true, version: '77' },
				{ name: 'Safari iOS', supported: false, version: 'No' },
				{ name: 'Samsung Internet', supported: true, version: '23' }
			]
		},
		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '115' },
				{ name: 'Edge', supported: true, version: '115' },
				{ name: 'Firefox', supported: false, version: '114' },
				{ name: 'Opera', supported: true, version: '101' },
				{ name: 'Safari', supported: false, version: 'No' }
			],
			feature: 'view-timeline',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '115' },
				{ name: 'Firefox Android', supported: false, version: 'No' },
				{ name: 'Opera Android', supported: true, version: '77' },
				{ name: 'Safari iOS', supported: false, version: 'No' },
				{ name: 'Samsung Internet', supported: true, version: '23' }
			]
		},
		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '127' },
				{ name: 'Edge', supported: true, version: '127' },
				{ name: 'Firefox', supported: false, version: '3' },
				{ name: 'Opera', supported: true, version: '113' },
				{ name: 'Safari', supported: true, version: '16.4' }
			],
			feature: 'font-size-adjust',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '127' },
				{ name: 'Firefox Android', supported: true, version: '4' },
				{ name: 'Opera Android', supported: true, version: '84' },
				{ name: 'Safari iOS', supported: true, version: '16.4' },
				{ name: 'Samsung Internet', supported: false, version: 'No' }
			]
		}
	];
</script>

<Table>
	<TableHeader>
		<TableRow
			class="*:border-border border-y-0 hover:bg-transparent [&>:not(:last-child)]:border-r"
		>
			<TableCell></TableCell>
			<TableHead class="border-b text-center" colspan={5}>
				<Monitor class="inline-flex" size={16} aria-hidden="true" />
				<span class="sr-only">Desktop browsers</span>
			</TableHead>
			<TableHead class="border-b text-center" colspan={5}>
				<Smartphone class="inline-flex" size={16} aria-hidden="true" />
				<span class="sr-only">Mobile browsers</span>
			</TableHead>
		</TableRow>
	</TableHeader>
	<TableHeader>
		<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
			<TableCell></TableCell>
			{#each items[0].desktop as browser (browser.name)}
				<TableHead class="text-foreground h-auto py-3 align-bottom">
					<span
						class="relative left-[calc(50%-.5rem)] block rotate-180 leading-4 whitespace-nowrap [text-orientation:sideways] [writing-mode:vertical-rl]"
					>
						{browser.name}
					</span>
				</TableHead>
			{/each}
			{#each items[0].mobile as browser (browser.name)}
				<TableHead class="text-foreground h-auto py-3 align-bottom">
					<span
						class="relative left-[calc(50%-.5rem)] block rotate-180 leading-4 whitespace-nowrap [text-orientation:sideways] [writing-mode:vertical-rl]"
					>
						{browser.name}
					</span>
				</TableHead>
			{/each}
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each items as item (item.feature)}
			<TableRow class="*:border-border [&>:not(:last-child)]:border-r">
				<TableHead class="text-foreground font-medium">
					{item.feature}
				</TableHead>
				{#each [...item.desktop, ...item.mobile] as browser, index (`${browser.name}-${index}`)}
					<TableCell class="space-y-1 text-center">
						{#if browser.supported}
							<Check class="inline-flex stroke-emerald-600" size={16} aria-hidden="true" />
						{:else}
							<X class="inline-flex stroke-red-600" size={16} aria-hidden="true" />
						{/if}
						<span class="sr-only">
							{browser.supported ? 'Supported' : 'Not supported'}
						</span>
						<div class="text-muted-foreground text-xs font-medium">
							{browser.version}
						</div>
					</TableCell>
				{/each}
			</TableRow>
		{/each}
	</TableBody>
</Table>
