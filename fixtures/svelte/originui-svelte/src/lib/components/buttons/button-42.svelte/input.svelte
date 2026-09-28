<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import RiFacebookFill from '~icons/ri/facebook-fill';
	import RiGithubFill from '~icons/ri/github-fill';
	import RiGoogleFill from '~icons/ri/google-fill';
	import RiTwitterXFill from '~icons/ri/twitter-x-fill';
</script>

<div class="inline-flex flex-wrap gap-2">
	<Button variant="outline" aria-label="Login with Google" size="icon">
		<RiGoogleFill width="16" height="16" aria-hidden="true" />
	</Button>
	<Button variant="outline" aria-label="Login with Facebook" size="icon">
		<RiFacebookFill width="16" height="16" aria-hidden="true" />
	</Button>
	<Button variant="outline" aria-label="Login with X" size="icon">
		<RiTwitterXFill width="16" height="16" aria-hidden="true" />
	</Button>
	<Button variant="outline" aria-label="Login with GitHub" size="icon">
		<RiGithubFill width="16" height="16" aria-hidden="true" />
	</Button>
</div>
