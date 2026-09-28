<script lang="ts">
  import '@docsearch/css'
  import docsearch from '@docsearch/js'

  const init = (searchContainer: HTMLElement) => {
    // @ts-expect-error idk
    docsearch({
      container: searchContainer,
      appId: 'AIGTN0IYT1',
      indexName: 'inspect-eirik',
      apiKey: 'ce7552a342fda13ea0251618e1e6c2ff',
      insights: true,
      placeholder: 'Search documentation',
    })
  }
</script>

<div use:init id="docsearch"></div>

<style>
  /*! @docsearch/css Variables 3.9.0 | MIT License | © Algolia, Inc. and contributors | https://docsearch.algolia.com */
  :root {
    --docsearch-primary-color: var(--base08);
    --docsearch-spacing: 12px;
    --docsearch-icon-stroke-width: 2;
    --docsearch-highlight-color: var(--docsearch-primary-color);
    --docsearch-modal-width: 560px;
    --docsearch-modal-height: 600px;
    --docsearch-searchbox-height: 56px;
    --docsearch-searchbox-shadow: inset 0 0 0 2px var(--docsearch-primary-color);
    --docsearch-hit-height: 56px;
    --docsearch-hit-active-color: var(--fg);
    --docsearch-footer-height: 44px;
    --docsearch-text-color: var(--fg);
    --docsearch-container-background: rgba(9, 10, 17, 0.8);
    --docsearch-modal-background: var(--bg);
    --docsearch-modal-shadow: inset 1px 1px 0 0 #2c2e40, 0 3px 8px 0 #000309;
    --docsearch-searchbox-background: var(--bg-code);
    --docsearch-searchbox-focus-background: #000;
    --docsearch-hit-color: #bec3c9;
    --docsearch-hit-shadow: none;
    --docsearch-hit-background: #090a11;
    --docsearch-key-gradient: linear-gradient(-26.5deg, #565872, #31355b);
    --docsearch-key-shadow: inset 0 -2px 0 0 #282d55, inset 0 0 1px 1px #51577d,
      0 2px 2px 0 rgba(3, 4, 9, 0.3);
    --docsearch-key-pressed-shadow: inset 0 -2px 0 0 #282d55, inset 0 0 1px 1px #51577d,
      0 1px 1px 0 #0304094d;
    --docsearch-footer-background: #1e2136;
    --docsearch-footer-shadow: inset 0 1px 0 0 rgba(73, 76, 106, 0.5),
      0 -4px 8px 0 rgba(0, 0, 0, 0.2);
    --docsearch-logo-color: var(--base08);
    --docsearch-muted-color: var(--fg);
  }

  div {
    padding-right: 1em;
  }
</style>
