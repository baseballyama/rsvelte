<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
</script>

<RadioGroup class="gap-6" value="small">
	<div class="flex items-start gap-2">
		<RadioGroupItem
			value="small"
			id="radio-04-small"
			aria-describedby="radio-04-small-description"
		/>
		<div class="grid grow gap-2">
			<Label for="radio-04-small">
				Small
				<span class="text-muted-foreground text-xs leading-[inherit] font-normal">
					(Sublabel)
				</span>
			</Label>
			<p id="radio-04-small-description" class="text-muted-foreground text-xs">
				You can use this card with a label and a description.
			</p>
		</div>
	</div>
	<div class="flex items-start gap-2">
		<RadioGroupItem value="r2" id="radio-04-r2" aria-describedby="radio-04-r2-description" />
		<div class="grid grow gap-2">
			<Label for="radio-04-r2">
				Large
				<span class="text-muted-foreground text-xs leading-[inherit] font-normal">
					(Sublabel)
				</span>
			</Label>
			<p id="radio-04-r2-description" class="text-muted-foreground text-xs">
				You can use this card with a label and a description.
			</p>
		</div>
	</div>
</RadioGroup>
