<script>let { options = [], children } = $props();</script>
<div>
  {#each options as option (option.id)}
    <button>
      {#if children}{@render children({ option })}{:else}
        {#if option.icon}<i class="wx-icon {option.icon} {!option.label ? 'wx-only' : ''}"></i>{/if}
        {#if option.label}<span class="wx-label">{option.label}</span>{/if}
      {/if}
    </button>
  {/each}
</div>
<style>
  .wx-icon + .wx-label { color: red; }
</style>