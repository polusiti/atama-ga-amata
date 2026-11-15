# Geometry view and "where the math stops": requirements

Theme: mathematical imperialism with a conscience. The store pushes mathematics into human intent, and says out loud where mathematics ends. Frankenstein's hubris, with a confession.

## Geometry (A)

Fisher-Rao geometry: the map p -> sqrt(p) sends a distribution to a point on the unit sphere, and the Fisher-Rao distance between p and q is twice the angle between sqrt(p) and sqrt(q). The shortest path (geodesic) between two beliefs is a great-circle arc. Two points on a sphere always lie in one plane through its center, so the arc between them can be drawn without distortion.

1. THE SYSTEM SHALL show a figure of the reference belief and the current belief on a quarter circle of angle pi/2, with the arc between them highlighted. The reference is the belief implied by the named solution, or the uniform belief when none is named.
2. THE SYSTEM SHALL draw the arc with angle theta = d / 2, where d is the Fisher-Rao distance, so the drawn angle is exact.
3. THE SYSTEM SHALL mark the geodesic midpoint of the two beliefs and name the need that leads there.
4. THE SYSTEM SHALL show the path length of the belief (sum of step distances) and the straight-line distance, and their ratio as "efficiency". Because of the triangle inequality the path is never shorter than the straight line.
5. Geodesic points SHALL be computed by a pure function whose points are distributions and move at constant speed along the arc.

## Where the math stops (B)

6. THE SYSTEM SHALL show, at the top of the About page, three groups: what is computed (exact for the model), what the author set by hand (with live counts and the current parameter values), and what mathematics cannot decide.
7. THE SYSTEM SHALL count the hand-set numbers from the data itself (question strengths, solution fits, model parameters, keyword weights), not from a typed constant.
8. THE SYSTEM SHALL link to this section from the inferred-needs box.

## Out of scope
Interactive 3D, plotting more than two beliefs on the arc, claims that the figure is more than a picture of the model.
