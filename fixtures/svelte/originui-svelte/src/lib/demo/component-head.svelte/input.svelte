<script lang="ts">
	import type { AvailableOUIComponent } from '$data/api/components/components.handler';

	import { PROJECT_NAME, SEO_DELIMITER } from '$lib/config';

	type Props = {
		component: AvailableOUIComponent;
	};

	let { component }: Props = $props();

	const title = `${component.name} ${SEO_DELIMITER} ${component.directory} ${SEO_DELIMITER} ${PROJECT_NAME}`;
	const description = `Overview of the ${component.name} component from the ${component.directory} directory.`;
	const keywords = `svelte, component, ${component.name}, ${component.directory}, origin ui, tailwindcss, ui, library`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
</svelte:head>
