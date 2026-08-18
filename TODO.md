# TODO

## Add CI and required merge gates, then let the weekly dependency PR use them

The weekly dependency-update workflow (#44) landed with two deliberate gaps,
both stated in its comments: this repository has no CI workflow to dispatch
against the weekly branch, and no required checks — so the workflow neither
dispatches CI nor arms auto-merge (with no gate, arming would be
self-approval). The end state is the bar the sibling repos already meet:
comprehensive automated review, required merge gates, and auto-merge.

- [ ] `ci.yml` running the same suite the update job runs (`npm ci`, `lint`,
      `typecheck`, `test`, `build`) on `pull_request` and pushes to main, with
      `workflow_dispatch` taking a `pr` input so the weekly workflow can
      dispatch it against the branch it pushes — a `GITHUB_TOKEN`-authored PR
      triggers nothing on its own. The docs-lane/`gate` shape from the shared
      `mikelward/lanes` action is the sibling repos' pattern.
- [ ] Codex review set — `codex-review.yml`, `codex-review-listener.yml`,
      `codex-review-check.yml` from mikelward/codex-review (its
      `docs/CONSUMER.md` explains the three load-bearing ruleset settings).
- [ ] Ruleset on `main`: require the `gate` (or `ci`) check, the `codex`
      status, and the Vercel deployment; require conversation resolution;
      require branches up to date.
- [ ] Enable auto-merge in repository settings (Settings → General → Pull
      Requests → Allow auto-merge).
- [ ] Re-widen `dependency-update.yml` once the above exist: restore the
      `ci.yml` + `codex-review-check.yml` dispatches and the `actions: write`
      scope on the publish job, arm auto-merge (`gh pr merge --auto --rebase`)
      the way gedmap does, and update the PR-body wording plus
      `.github/workflows/dependency-update.test.ts` — the "says on the PR that
      no CI will run there" and "uses only first-party actions" tests encode
      today's no-CI state on purpose.
- [x] Align `.nvmrc` with `engines.node` — done in #46 (`.nvmrc` is now `24`).

Until the boxes are checked, the weekly PR's in-job checks are its only
verification and merging it is manual — which its body says on every PR it
opens.
