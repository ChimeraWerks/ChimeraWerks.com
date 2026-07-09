/**
 * App registry for the ecosystem section. Order matters: flagship first,
 * teaser last. hueIndex selects --card-hue-N (0-7) for the card spine.
 */

export type AppStatus = "active" | "incubating";

export interface EcosystemApp {
  id: string;
  name: string;
  tagline: string;
  blurb: string;
  hueIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: AppStatus;
  flagship?: boolean;
}

export const ECOSYSTEM: EcosystemApp[] = [
  {
    id: "relay",
    name: "Chimera Relay",
    tagline: "Multi-agent orchestration console",
    blurb:
      "Run fleets of coding agents (Codex, Claude, Hermes, and more) in shared rooms with personas, DNA runs, and judge panels. One console for the whole fleet.",
    hueIndex: 6,
    status: "active",
    flagship: true,
  },
  {
    id: "dna",
    name: "Chimera DNA",
    tagline: "Agent orchestration language",
    blurb:
      "Describe fusion, judge-panel, debate, and map-reduce multi-agent runs in one declarative format, then execute them across any harness.",
    hueIndex: 0,
    status: "active",
  },
  {
    id: "library",
    name: "Chimera Library",
    tagline: "Skill & tool librarian",
    blurb:
      "A source-of-truth registry that recommends the right skills, modules, and tools to any agent harness on demand.",
    hueIndex: 1,
    status: "active",
  },
  {
    id: "browser",
    name: "Chimera Browser",
    tagline: "Agent-driven browser automation",
    blurb:
      "A Camoufox-based local automation service that gives agents a real browser, with Playwright traces and VNC debugging when things get weird.",
    hueIndex: 3,
    status: "active",
  },
  {
    id: "imagelab",
    name: "Chimera Image Lab",
    tagline: "Local-first image generation",
    blurb:
      "OAuth-only gpt-image-2 generation and editing with no provider API keys, driven from CLI, HTTP, or MCP.",
    hueIndex: 5,
    status: "active",
  },
  {
    id: "more",
    name: "…and more in the werks",
    tagline: "Always something on the bench",
    blurb:
      "Ports registries, passkey gateways, research pipelines, federated wikis. The workshop never really closes.",
    hueIndex: 7,
    status: "incubating",
  },
];
