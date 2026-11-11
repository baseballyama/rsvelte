<script>let header, open;</script>
<button>
  {#if header}
    {@render header()}
    {#if open}
      <svg viewBox="0 0 10 6"><path d="M9 5" /></svg>
    {/if}
  {/if}
</button>