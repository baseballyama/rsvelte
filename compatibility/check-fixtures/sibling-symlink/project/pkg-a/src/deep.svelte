<script lang="ts">
	import SurveyOptions, { type WithOther } from 'libs/components/survey-options.svelte';

	const answer: WithOther<'a' | 'b'> = 'OTHER: c';
</script>

<SurveyOptions id={answer} />
