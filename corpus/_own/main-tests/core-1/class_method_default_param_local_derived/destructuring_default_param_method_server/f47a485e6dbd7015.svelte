<script>
class Service {
  data = $state([]);
  getTimeline({ limit = 10 } = {}) {
    const view = $derived.by(() => this.data.slice(0, limit));
    return view;
  }
}
</script>