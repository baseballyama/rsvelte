<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    children: Snippet;
  }

  let { text, position = 'top', delay = 500, children }: Props = $props();

  let showTooltip = $state(false);
  let tooltipTimeout: ReturnType<typeof setTimeout>;

  /**
   * Show tooltip after delay
   */
  function handleMouseEnter() {
    tooltipTimeout = setTimeout(() => {
      showTooltip = true;
    }, delay);
  }

  /**
   * Hide tooltip immediately
   */
  function handleMouseLeave() {
    clearTimeout(tooltipTimeout);
    showTooltip = false;
  }
</script>

<div class="tooltip-container" role="tooltip" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
  {@render children()}

  {#if showTooltip}
    <div class="tooltip {position}">
      {text}
    </div>
  {/if}
</div>

<style>
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    z-index: 1000;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    white-space: nowrap;
    box-shadow: var(--shadow-lg);
    pointer-events: none;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 4px solid transparent;
  }

  .tooltip.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--spacing-xs);
  }

  .tooltip.top::before {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--border-primary);
  }

  .tooltip.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--spacing-xs);
  }

  .tooltip.bottom::before {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: var(--border-primary);
  }

  .tooltip.left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: var(--spacing-xs);
  }

  .tooltip.left::before {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: var(--border-primary);
  }

  .tooltip.right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--spacing-xs);
  }

  .tooltip.right::before {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: var(--border-primary);
  }
</style>
