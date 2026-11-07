<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
	import Textarea from '$lib/components/ui/textarea.svelte';

	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Rating</Dialog.Trigger>
	<Dialog.Content class="flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5">
		<Dialog.Header class="contents space-y-0 text-left">
			<Dialog.Title class="border-border border-b px-6 py-4 text-base">
				Help us improve
			</Dialog.Title>
		</Dialog.Header>
		<div class="px-6 py-4">
			<form class="space-y-5">
				<div class="space-y-4">
					<div>
						<fieldset class="space-y-4">
							<legend class="text-foreground text-lg leading-none font-semibold">
								How hard was it to set up your account?
							</legend>
							<RadioGroup
								value=""
								class="flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5"
							>
								{#each Array.from({ length: 9 }) as _, index (index)}
									<label
										for="radio-17-r{index}"
										class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:outline-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm outline-offset-2 transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:outline-2 has-focus-visible:outline-solid has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10"
									>
										<RadioGroupItem
											id="radio-17-r{index}"
											value="r{index}"
											class="sr-only after:absolute after:inset-0"
										/>
										{index}
									</label>
								{/each}
							</RadioGroup>
						</fieldset>
						<div class="text-muted-foreground mt-2 flex justify-between text-xs">
							<p>Very easy</p>
							<p>Very dificult</p>
						</div>
					</div>
					<div class="space-y-2">
						<Label>Why did you give this rating?</Label>
						<Textarea
							id="feedback"
							placeholder="How can we improve Origin UI?"
							aria-label="Send feedback"
						/>
					</div>
				</div>
				<Button type="button" class="w-full">Send feedback</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
