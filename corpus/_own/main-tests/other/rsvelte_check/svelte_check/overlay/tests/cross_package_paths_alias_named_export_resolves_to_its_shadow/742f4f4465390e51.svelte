<script lang="ts">
import SurveyOptions, { type WithOther } from '$libs/components/survey-options.svelte';
type X = WithOther<'a' | 'b'>;
</script>
<SurveyOptions id="a" />
