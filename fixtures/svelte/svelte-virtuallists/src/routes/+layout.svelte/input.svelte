<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';
  import '../app.css';
  import theme from 'svelte-highlight/styles/night-owl';
  import Contents, { type Page, type Section } from '../comp/Contents.svelte';
  import RTLToggle from '../comp/RTLToggle.svelte';
  import { pathIsCurrent } from '../comp/pathUtils';

  type Props = {
    children: Snippet;
  };

  const { children }: Props = $props();

  let isRTL: boolean = $state(false);

  const sections: Section[] = [
    {
      title: 'Getting started',
      pages: [{ title: 'Introduction', path: '/' }]
    },
    {
      title: 'General Examples',
      pages: [
        { title: 'Vertical', path: '/examples/vertical' },
        { title: 'Horizontal', path: '/examples/horizontal' },
        { title: 'Table/Grid', path: '/examples/table' },
        { title: 'Variable Sizing', path: '/examples/variablesizing' },
        { title: 'Positioning', path: '/examples/positioning' },
        { title: 'Events', path: '/examples/events' }
      ]
    }
  ];

  const pages: Page[] = $state(sections.map(section => section.pages).flat());
  const pageIdx: number = $derived(pages.findIndex(({ path }) => pathIsCurrent(path, $page)));
  const curPage: Page | undefined = $derived(pageIdx >= 0 ? pages[pageIdx] : undefined);
  const prevPage: Page | undefined = $derived(pageIdx >= 1 ? pages[pageIdx - 1] : undefined);
  const nextPage: Page | undefined = $derived(
    pageIdx >= 0 && pageIdx < pages.length - 1 ? pages[pageIdx + 1] : undefined
  );
</script>

<svelte:head>
  <title>Svelte-Virtuallists{curPage ? ` - ${curPage.title}` : ''}</title>
  <meta name="description" content="A Fantastic virtual list for Svelte 5 and above" />
  {@html theme}
</svelte:head>

<div class="page-container">
  <div role="presentation" class="toc-container-space"></div>

  <main class:rtl-containers={isRTL}>
    {@render children()}

    <div class="controls">
      <div>
        <span class:faded={!prevPage}>previous</span>
        {#if prevPage}
          <a data-sveltekit-preload-data href={base + prevPage.path}>{prevPage.title}</a>
        {/if}
      </div>

      <div>
        <span class:faded={!nextPage}>next</span>
        {#if nextPage}
          <a data-sveltekit-preload-data href={base + nextPage.path}>{nextPage.title}</a>
        {/if}
      </div>
    </div>
  </main>

  <div class="toc-container">
    <div role="presentation" class="toc-contents-wrap">
      <h1 class="toc-head">
        <img src="{base}/favicon.svg" alt="Icon" width="30" height="30" />
        Svelte-Virtuallists
      </h1>
      <Contents contents={sections} />
    </div>

    <RTLToggle bind:isRTL />
  </div>
</div>

<style>
  .page-container {
    display: table;
    font-size: 14px;
    width: 100%;
  }

  main {
    max-width: 1150px;
    margin-left: auto;
    margin-right: auto;
    padding: 10px;
    overflow-x: auto;
  }

  .controls {
    border-top: 1.6px solid rgb(232, 228, 253);
    padding: 12px 0 0 0;
    display: flex;
    justify-content: space-between;
    margin: 40px 0;
    gap: 15px;
  }

  .controls > :first-child {
    text-align: left;
  }

  .controls > :last-child {
    text-align: right;
  }

  .controls span {
    display: block;
    font-size: 14px;
    text-transform: uppercase;
    font-weight: 600;
    color: rgb(103, 103, 121);
    margin-bottom: 4px;
  }

  .controls span.faded {
    opacity: 0.4;
  }

  .controls a {
    text-decoration: none;
    font-size: 16px;
    color: rgb(255, 64, 0);
  }

  .controls a:not(:hover) {
    text-decoration: none;
  }

  .rtl-containers :global(.splitpanes) {
    direction: rtl;
  }

  .toc-container-space {
    display: none;
  }

  .toc-container {
    display: flex;
    flex-flow: column-reverse nowrap;
    background: rgb(247, 250, 253);
    color: rgb(65, 65, 72);
  }

  .toc-head {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    padding-left: 10px;
  }

  @media (min-width: 832px) {
    .page-container {
      display: flex;
      flex-flow: row nowrap;
    }

    .toc-container-space {
      display: block;
      min-width: 300px;
      width: 300px;
      height: 100vh;
      margin: auto 0;
    }

    main {
      flex-grow: 1;
    }

    .toc-container {
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      width: 300px;
      height: 100vh;
    }

    .toc-contents-wrap {
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
      padding: 10px;
    }
  }
</style>
