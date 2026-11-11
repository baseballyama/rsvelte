<script lang="ts">
  export let n = 0;

  let tabs: {
    a: string;
    // keep-me
    b: number;
  }[] = [];

  $: {
    tabs = [{ a: "x", b: n }];
  }
</script>

<p>{tabs.length}</p>
