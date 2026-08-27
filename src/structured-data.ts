// shared @id ties smelter.dev to the same organization entity as our other sites
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://swmansion.com/#organization",
      name: "Software Mansion",
      url: "https://swmansion.com",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://smelter.dev/#software",
      name: "Smelter",
      url: "https://smelter.dev",
      description:
        "Low-latency video compositing tool with seamless developer experience. Use it for live streaming, broadcasting, video conferencing and more.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Linux, macOS, Web",
      publisher: { "@id": "https://swmansion.com/#organization" },
    },
  ],
};

export const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003c");
