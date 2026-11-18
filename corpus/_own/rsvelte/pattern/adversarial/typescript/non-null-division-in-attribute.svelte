<script lang="ts">
  let duration: number | undefined = $state(1000);
</script>

<!-- A postfix non-null assertion ends an operand. The following slash is
     division, while the slash after prefix logical-not below opens a regex. -->
<output data-seconds={duration! / 1000}>
  {!/negative/.test(String(duration))}
</output>
