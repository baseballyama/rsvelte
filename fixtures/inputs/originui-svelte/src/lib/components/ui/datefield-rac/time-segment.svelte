<script lang="ts">
	import { cn } from '$lib/utils';
	import { TimeField, type TimeSegmentPart } from 'bits-ui';

	interface Props {
		class?: string;
		segment: {
			part: TimeSegmentPart;
			value: string;
		};
	}

	let { class: className, segment }: Props = $props();
</script>

<TimeField.Segment
	part={segment.part}
	class={cn(
		'text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
		'data-[segment=literal]:text-muted-foreground/70 data-[segment=literal]:px-0',
		className
	)}
>
	{segment.value}
</TimeField.Segment>
