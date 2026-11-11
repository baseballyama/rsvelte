<script lang="ts">
	import { SurveyOptions, SURVEY_OTHER_PREFIX, type WithOther } from 'libs/components';

	const answer: WithOther<'a' | 'b'> = `${SURVEY_OTHER_PREFIX}c`;
</script>

<SurveyOptions id={answer} />
