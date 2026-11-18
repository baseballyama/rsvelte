<script>
  let count = $state(1);
  let doubled = $derived(count * 2);
  let total = $derived.by(() => doubled + count);
  let rounded = $derived(Math.floor(count / 10));
  class Counter {
    value = $state(2);
    twice = $derived(this.value * 2);
    #hidden = $derived.by(() => this.value + 1);
    override() { this.twice = 20; this.#hidden = 30; }
    get hidden() { return this.#hidden; }
  }
  let counter = $state(new Counter());
</script>
<button class="override" onclick={() => { doubled = 100; total = 200; rounded = 80; counter.override(); }}>override</button>
<button class="update" onclick={() => { count++; counter.value++; }}>update</button>
<button class="null" onclick={() => doubled = null}>null</button>
<button class="undefined" onclick={() => doubled = undefined}>undefined</button>
<button class="compound" onclick={() => { doubled += 5; total++; counter.twice++; }}>compound</button>
<p>{count}:{doubled}:{total}:{rounded}:{counter.value}:{counter.twice}:{counter.hidden}</p>
