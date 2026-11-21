/**
 * Runs the snippets of the code and test questions of the knowledge check and prints what really happens, so that the
 * answer keys in `src/data/knowledge-items.ts` can be checked again after a change of Node or of the data.
 * Run: `npx tsx scripts/verify-code-items.ts`. The expectations below are the facts the keys rest on; the script exits
 * with an error if one of them no longer holds.
 */
import assert from "node:assert";

const failures: string[] = [];
function expect(name: string, actual: unknown, wanted: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(wanted);
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${JSON.stringify(actual)}`);
  if (!ok) failures.push(`${name}: wanted ${JSON.stringify(wanted)}, got ${JSON.stringify(actual)}`);
}

async function main(): Promise<void> {
  // code-1: Array.prototype.sort sorts in place, returns the same array, and compares as strings by default.
  const nums = [3, 1, 2];
  const sorted = nums.sort();
  expect("code-1 nums === sorted", nums === sorted, true);
  expect("code-1 nums after sort", nums, [1, 2, 3]);
  expect("code-1 [10,9,1].sort()", [10, 9, 1].sort(), [1, 10, 9]);

  // code-2: a var in a for header is shared by all the closures.
  const fns: (() => number)[] = [];
  // eslint-disable-next-line no-var
  for (var i = 0; i < 3; i++) fns.push(() => i);
  expect("code-2 var output", fns.map((f) => f()), [3, 3, 3]);
  const fns2: (() => number)[] = [];
  for (let j = 0; j < 3; j++) fns2.push(() => j);
  expect("code-2 let output", fns2.map((f) => f()), [0, 1, 2]);

  // code-3: forEach does not wait for an async callback.
  let count = 0;
  [1, 2, 3].forEach(async (n) => {
    await null;
    count += n;
  });
  expect("code-3 count right after forEach", count, 0);
  await new Promise((r) => setTimeout(r, 10));
  expect("code-3 count after the awaits settle", count, 6);

  // test-1: the fourth assertion is the wrong one: 0 is even.
  const isEven = (n: number) => n % 2 === 0;
  const results = [() => assert(isEven(2)), () => assert(isEven(3) === false), () => assert(isEven(-4)), () => assert(isEven(0) === false)].map((f) => {
    try {
      f();
      return "pass";
    } catch {
      return "fail";
    }
  });
  expect("test-1 assertions", results, ["pass", "pass", "pass", "fail"]);

  // test-2: a weak assertion passes for plausible mistakes; the exact one does not.
  const mk = (rate: number) => (price: number) => (price > 100 ? price * rate : price);
  const attempt = (f: () => void) => {
    try {
      f();
      return "pass";
    } catch {
      return "fail";
    }
  };
  for (const [rate, weak, strict] of [[0.8, "pass", "pass"], [0.5, "pass", "fail"], [0.99, "pass", "fail"]] as const) {
    const d = mk(rate);
    expect(`test-2 rate ${rate} weak`, attempt(() => assert.ok(d(200) < 200)), weak);
    expect(`test-2 rate ${rate} exact`, attempt(() => assert.strictEqual(d(200), 160)), strict);
  }

  // test-3: tests that share state depend on the order they run in.
  const run = (order: ("A" | "B")[]) => {
    const cart: number[] = [];
    const add = (x: number) => cart.push(x);
    const tests = {
      A: () => {
        add(1);
        assert.deepStrictEqual(cart, [1]);
      },
      B: () => {
        add(2);
        assert.deepStrictEqual(cart, [2]);
      },
    };
    return order.map((k) => `${k}:${attempt(tests[k])}`);
  };
  expect("test-3 A then B", run(["A", "B"]), ["A:pass", "B:fail"]);
  expect("test-3 B alone", run(["B"]), ["B:pass"]);
  expect("test-3 B then A", run(["B", "A"]), ["B:pass", "A:fail"]);

  console.log(`node ${process.version}`);
  if (failures.length > 0) {
    console.error("\nFacts that no longer hold:\n" + failures.join("\n"));
    process.exit(1);
  }
}

main();
