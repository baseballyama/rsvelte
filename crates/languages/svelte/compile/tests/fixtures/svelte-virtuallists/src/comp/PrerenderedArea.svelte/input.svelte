<script lang="ts">
  import { browser, dev } from '$app/environment';
  import type { Snippet } from 'svelte';
  import type { Action } from 'svelte/action';

  let {
    /** For dev mode, to work with hot reload, you want to see if the content has been changed. */
    content,
    /** ID of the area, so there will be no collision. */
    id,
    children
  }: {
    content?: string;
    id: string;
    children: Snippet;
  } = $props();

  const getIdFull = (id: string) => `prerendered_area_${id}`;

  function getArea() {
    if (!browser) {
      return null;
    }
    // otherwise

    const element = document.getElementById(getIdFull(id));

    if (element) {
      if (
        !dev ||
        (element.hasAttribute('data-content') && element.getAttribute('data-content') === content)
      ) {
        return element;
      }
    }
  }

  /** Capture area on initialization (only in browser), before mounting! */
  const area = getArea();

  let duplicatedChildren: Node[] | null = null;

  if (area) {
    const childs = area.childNodes;
    duplicatedChildren = Array.from(childs).map(child => child.cloneNode(true));
  }

  const areaAction: Action = (node: HTMLElement) => {
    // After mounting, we need to fill the new area with the prerendered one clones
    if (area !== null) {
      duplicatedChildren?.forEach(child => {
        node.appendChild(child);
      });
    }
  };
</script>

<div role="presentation" id={getIdFull(id)} data-content={dev ? content : undefined} use:areaAction>
  {#if area === null}
    {@render children()}
  {/if}
</div>
