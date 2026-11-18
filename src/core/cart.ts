import type { EvidenceLevel, KnowledgeBase, SpecSheet } from "./types";

/**
 * Checks a cart of exit moves: the order by prerequisites, the prerequisites that are missing, the number of steps,
 * and how much evidence the cart rests on. It never blocks anything; it says what it sees.
 * `requires` is acyclic (tested in the data), so a depth-first walk ends.
 */
export interface CartReport {
  /** Cart moves ordered so that a move follows its prerequisites that are also in the cart. Ties keep the cart order. */
  order: string[];
  /** For each cart move: the prerequisites that are neither in the cart nor already in place, all the way down. */
  missing: { id: string; needs: string[] }[];
  /** The missing prerequisites, each once, in an order that respects their own prerequisites. */
  suggestAdd: string[];
  /** Number of steps over all the moves in the cart. */
  steps: number;
  /** Cart moves per evidence level. A move without a sheet counts as "none". */
  evidence: Record<EvidenceLevel, number>;
  /** True when the cart is not empty and every move counts as "none". */
  allNoData: boolean;
}

export function checkCart(
  kb: KnowledgeBase,
  cartIds: readonly string[],
  established: ReadonlySet<string>,
  sheets: Readonly<Record<string, SpecSheet>> = {},
): CartReport {
  const byId = new Map(kb.solutions.map((s) => [s.id, s]));
  const cart = [...new Set(cartIds)].filter((id) => byId.has(id));
  const inCart = new Set(cart);

  // Order the cart: visit prerequisites first, but only those that are in the cart.
  const order: string[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const r of byId.get(id)?.requires ?? []) if (inCart.has(r)) visit(r);
    order.push(id);
  };
  for (const id of cart) visit(id);

  // Missing prerequisites, all the way down: not in the cart, not in place.
  const needsOf = (id: string, acc: Set<string>) => {
    for (const r of byId.get(id)?.requires ?? []) {
      if (inCart.has(r) || established.has(r) || acc.has(r)) continue;
      acc.add(r);
      needsOf(r, acc);
    }
  };
  const missing: { id: string; needs: string[] }[] = [];
  const allMissing = new Set<string>();
  for (const id of order) {
    const acc = new Set<string>();
    needsOf(id, acc);
    if (acc.size > 0) missing.push({ id, needs: [...acc] });
    acc.forEach((x) => allMissing.add(x));
  }

  // Suggested additions, ordered by their own prerequisites.
  const suggestAdd: string[] = [];
  const placed = new Set<string>();
  const place = (id: string) => {
    if (placed.has(id)) return;
    placed.add(id);
    for (const r of byId.get(id)?.requires ?? []) if (allMissing.has(r)) place(r);
    suggestAdd.push(id);
  };
  for (const id of allMissing) place(id);

  const evidence: Record<EvidenceLevel, number> = { none: 0, "problem-studied": 0, "method-published": 0 };
  let steps = 0;
  for (const id of cart) {
    steps += byId.get(id)?.requirements.length ?? 0;
    evidence[sheets[id]?.evidence.level ?? "none"]++;
  }
  return { order, missing, suggestAdd, steps, evidence, allNoData: cart.length > 0 && evidence.none === cart.length };
}
