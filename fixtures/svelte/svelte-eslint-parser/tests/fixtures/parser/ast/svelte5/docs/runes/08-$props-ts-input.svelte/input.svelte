<script lang="ts">
  type MyProps = {};
  let { a, b, c, ...everythingElse }: MyProps = $props();
</script>
