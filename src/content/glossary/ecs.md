---
term: "ECS (Entity-Component-System)"
definition: "An architecture where objects (entities) are just IDs, data lives in components, and behaviour lives in systems that operate on entities matching a component signature."
aliases: ["Entity Component System", "ECS"]
tags: ["gamedev", "graphics", "architecture"]
---

Popular in game engines because it favours composition over inheritance and
keeps hot data packed together for cache-friendly iteration.

- **Entity** — just an id, no data or logic of its own.
- **Component** — plain data (e.g. `Position`, `Velocity`).
- **System** — logic that runs once per frame over every entity that has a
  particular set of components.
