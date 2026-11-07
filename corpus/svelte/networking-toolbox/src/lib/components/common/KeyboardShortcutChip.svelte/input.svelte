<script lang="ts">
  import { formatShortcut } from '$lib/utils/keyboard';

  interface Props {
    label: string;
    shortcut: string;
    onclick?: () => void;
  }

  let { label, shortcut, onclick }: Props = $props();

  const formattedShortcut = $derived(formatShortcut(shortcut));
</script>

<button class="shortcut-chip" {onclick} aria-label="{label} - {formattedShortcut}">
  <span class="chip-label">{label}</span>
  <span class="chip-shortcut">{formattedShortcut}</span>
</button>

<style lang="scss">
  .shortcut-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-xs);
    font-family: var(--font-mono);
    color: var(--text-primary);
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
    animation: chipAppear 0.4s ease-out;
    justify-content: space-between;

    &:hover {
      background-color: var(--surface-hover);
      border-color: var(--color-primary);
      transform: translateY(-1px) scale(1.02);
      box-shadow: var(--shadow-md);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.98) translateY(1px);
      box-shadow: var(--shadow-sm);
    }

    .chip-label {
      font-weight: 500;
      color: var(--text-primary);
    }

    .chip-shortcut {
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-secondary);
      border-radius: var(--radius-sm);
      padding: 2px var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }
  }

  @keyframes chipAppear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
