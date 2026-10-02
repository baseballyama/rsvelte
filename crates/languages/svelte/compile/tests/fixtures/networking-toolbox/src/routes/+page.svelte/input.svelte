<script lang="ts">
  import '../styles/pages.scss';
  import { onMount } from 'svelte';
  import { homepageLayout } from '$lib/stores/homepageLayout';
  import HomepageCategories from '$lib/components/home/HomepageCategories.svelte';

  interface Props {
    data: {
      toolPages: any[];
      referencePages: any[];
    };
  }

  let { data }: Props = $props();

  let currentLayout = $state(homepageLayout);

  // Lazy load homepage layouts (keep Categories eager as it's most common)
  const layoutComponents = {
    minimal: () => import('$lib/components/home/HomepageMinimal.svelte'),
    default: () => import('$lib/components/home/HomepageDefault.svelte'),
    carousel: () => import('$lib/components/home/HomepageCarousel.svelte'),
    bookmarks: () => import('$lib/components/home/HomepageBookmarks.svelte'),
    'small-icons': () => import('$lib/components/home/HomepageSmallIcons.svelte'),
    list: () => import('$lib/components/home/SiteMapList.svelte'),
    search: () => import('$lib/components/home/HomepageSearch.svelte'),
    empty: () => import('$lib/components/home/HomepageEmpty.svelte'),
  } as const;

  // Get the dynamic component for current layout
  const layoutComponent = $derived(
    $currentLayout === 'categories' ? null : layoutComponents[$currentLayout as keyof typeof layoutComponents]?.(),
  );

  onMount(() => {
    homepageLayout.init();
  });
</script>

{#if $currentLayout === 'categories'}
  <HomepageCategories toolPages={data.toolPages} referencePages={data.referencePages} />
{:else if layoutComponent}
  {#await layoutComponent}
    <div class="loading-layout">Loading...</div>
  {:then module}
    {@const Component = module.default as any}
    {#if $currentLayout === 'list'}
      <Component homeMode={true} />
    {:else if $currentLayout === 'minimal' || $currentLayout === 'default'}
      <Component toolPages={data.toolPages} referencePages={data.referencePages} />
    {:else}
      <Component />
    {/if}
  {/await}
{:else}
  <HomepageCategories toolPages={data.toolPages} referencePages={data.referencePages} />
{/if}

<style>
  .loading-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    color: var(--text-secondary);
  }
</style>
