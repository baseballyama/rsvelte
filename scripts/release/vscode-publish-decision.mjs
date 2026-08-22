// The publish decision for `rsvelte-vscode`, as a pure function of the two
// registry states, so it can be tested without a network or a token.
//
// Three answers have to stay distinguishable per registry, because two of them
// used to collapse into one and that is what published over a live version:
// `null`      — the query itself failed; nothing is known
// `latest: null` — the registry definitively holds no version
// `latest: x`    — the registry holds `x`

/** Numeric semver compare for simple `x.y.z` versions (no pre-release). */
export function cmp(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * @param {object} input
 * @param {string} input.target            version being published
 * @param {null | { latest: string | null, live: Set<string> }} input.mp
 * @param {null | { latest: string | null }} input.ovsx
 * @param {boolean} input.hasOvsx          an OVSX_PAT is available
 * @param {boolean} input.force            VSCODE_PUBLISH_FORCE
 * @param {string[]} input.platforms       every (version, targetPlatform) pair
 * @returns {{ missingMp: string[], needMp: boolean, needOvsx: boolean,
 *             mpReason: 'query-failed' | 'name-reserved' | 'superseded' | 'publish' | 'up-to-date' }}
 */
export function decide({ target, mp, ovsx, hasOvsx, force, platforms }) {
  const mpAbsent = mp !== null && mp.latest === null && mp.live.size === 0;
  const ovsxAtOrAhead =
    ovsx !== null && ovsx.latest !== null && cmp(ovsx.latest, target) >= 0;
  // The gallery holding no record of an extension whose target version is
  // already on Open VSX is a contradiction only one state produces: the
  // Marketplace copy is unlisted (removed, or failed validation) while its name
  // stays reserved. `vsce publish` answers that with "already exists", which no
  // retry moves — so publishing here fails every push until a human restores or
  // renames the extension. A new version still gets a real attempt, because
  // Open VSX is then behind and this guard does not fire.
  const nameReserved = mpAbsent && ovsxAtOrAhead;
  const superseded = mp !== null && Boolean(mp.latest) && cmp(target, mp.latest) < 0;

  const missingMp =
    mp === null || nameReserved || superseded
      ? []
      : platforms.filter((p) => !mp.live.has(p));
  const needMp = force || missingMp.length > 0;

  const needOvsx =
    hasOvsx &&
    (force ||
      (ovsx !== null &&
        (ovsx.latest === null || cmp(target, ovsx.latest) > 0)));

  let mpReason = 'up-to-date';
  if (needMp) mpReason = 'publish';
  else if (mp === null) mpReason = 'query-failed';
  else if (nameReserved) mpReason = 'name-reserved';
  else if (superseded) mpReason = 'superseded';

  return { missingMp, needMp, needOvsx, mpReason };
}
