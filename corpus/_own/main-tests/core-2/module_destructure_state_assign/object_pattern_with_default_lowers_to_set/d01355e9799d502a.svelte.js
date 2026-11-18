let raw_issues = $state([]);
let result = $state(undefined);
export function apply(response) {
  ({ issues: raw_issues = [], result } = response._ ?? {});
}
