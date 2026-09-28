<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import RiFacebookFill from '~icons/ri/facebook-fill';
	import RiGithubFill from '~icons/ri/github-fill';
	import RiGoogleFill from '~icons/ri/google-fill';
	import RiTwitterXFill from '~icons/ri/twitter-x-fill';
</script>

<div class="flex flex-wrap gap-2">
	<Button class="flex-1" variant="outline" aria-label="Login with Google" size="icon">
		<RiGoogleFill
			class="dark:text-primary text-[#DB4437]"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	</Button>
	<Button class="flex-1" variant="outline" aria-label="Login with Facebook" size="icon">
		<RiFacebookFill
			class="dark:text-primary text-[#1877f2]"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	</Button>
	<Button class="flex-1" variant="outline" aria-label="Login with X" size="icon">
		<RiTwitterXFill
			class="dark:text-primary text-[#14171a]"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	</Button>
	<Button class="flex-1" variant="outline" aria-label="Login with GitHub" size="icon">
		<RiGithubFill class="dark:text-primary text-black" width="16" height="16" aria-hidden="true" />
	</Button>
</div>
