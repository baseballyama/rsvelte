<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import BotMessageSquareIcon from '@lucide/svelte/icons/bot-message-square';
	import MessageCircleDashedIcon from '@lucide/svelte/icons/message-circle-dashed';
	import { UserMenu } from '$lib/components/_extras/navbars';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectGroupHeading,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';

	const aiModels = [
		{
			description: 'Balanced performance and creativity',
			label: 'Orion-Alpha 4.5',
			value: 'orion-alpha-45'
		},
		{
			description: 'Optimized for code generation and understanding',
			label: 'Orion-Code 4',
			value: 'orion-code-4'
		},
		{
			description: 'Excels at natural, engaging conversations',
			label: 'Nova-Chat 4',
			value: 'nova-chat-4'
		},
		{
			description: 'Most powerful model for complex tasks',
			label: 'Galaxy-Max 4',
			value: 'galaxy-max-4'
		}
	];
	let selectedModel = $state(aiModels[0].value);
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<div>
			<Select type="single" items={aiModels} onValueChange={(value) => (selectedModel = value)}>
				<SelectTrigger>
					<div class="[&>svg]:text-muted-foreground/80 flex items-center gap-2 [&>svg]:shrink-0">
						{#if selectedModel}
							<BotMessageSquareIcon size={16} aria-hidden="true" />
							<span class="truncate">
								{aiModels.find((model) => model.value === selectedModel)?.label ||
									'Choose an AI model'}
							</span>
						{/if}
					</div>
				</SelectTrigger>
				<SelectContent
					class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
				>
					<SelectGroup>
						<SelectGroupHeading class="ps-2">Models</SelectGroupHeading>

						{#each aiModels as aiModel (aiModel.value)}
							<SelectItem value={aiModel.value}>
								{aiModel.label}
								<span class="text-muted-foreground mt-1 block text-xs">
									{aiModel.description}
								</span>
							</SelectItem>
						{/each}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>

		<!-- Right side: Actions -->
		<div class="flex items-center justify-end gap-2">
			<!-- Layout button -->
			<Button
				size="icon"
				variant="ghost"
				class="text-muted-foreground size-8 rounded-full shadow-none"
				aria-label="Temporary chat"
			>
				<MessageCircleDashedIcon size={16} aria-hidden="true" />
			</Button>
			<!-- User menu -->
			<UserMenu />
		</div>
	</div>
</header>
