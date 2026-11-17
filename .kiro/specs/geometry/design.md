# Geometry: design

## What is drawn
Belief over needs is a point on the probability simplex. Fisher-Rao distance between two beliefs is `2*arccos(sum sqrt(p_i q_i))`. The figure draws the exact geodesic between the start and the current belief (`geodesicPoint`, constant speed). `pathLength` sums the steps of the session and is never shorter than the straight distance (tested in `explain.test.ts`).

## Honesty panel ("where the math stops")
Counts the hand-authored numbers in the loaded pack straight from the data (not a typed constant). States that the geometry is exact for the model and says nothing about whether the numbers are right.

## Why it stays small
The geometry is an explanation and a check, not the product's subject. The domain is problem solving, not mathematics.

## Tests
fast-check properties in `math.test.ts`: symmetry, zero on identical beliefs, range, triangle inequality, pi for disjoint support, local match to sqrt of KL, geodesic endpoints and constant speed, divergence bounds.