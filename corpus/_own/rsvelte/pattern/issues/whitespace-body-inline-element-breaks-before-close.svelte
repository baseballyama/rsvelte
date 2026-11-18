<script>
  let { option } = $props();
</script>

{#if option.icon}
  <i
    class="wx-icon {option.icon} {!option.label
      ? 'wx-only'
      : ''} wx-icon-padding"
  >
  </i>
{/if}
<div>
  <i class="wx-icon-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
  </i>
  <i class="wx-icon-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"> </i>
</div>
<div>
  some text <i class="wx-icon-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
  </i>
</div>
