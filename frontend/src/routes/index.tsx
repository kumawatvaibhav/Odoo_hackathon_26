import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Regions } from "@/components/site/Regions";
import { Trips } from "@/components/site/Trips";
import { Features } from "@/components/site/Features";
import { Demo } from "@/components/site/Demo";
import { Community } from "@/components/site/Community";
import { Signup } from "@/components/site/Signup";
import { Footer } from "@/components/site/Footer";
import { PlanFab } from "@/components/site/PlanFab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Design multi-city travel loops" },
      {
        name: "description",
        content:
          "Traveloop blends smart budgets, collaborative planning, and rich discovery so every multi-city trip feels effortless and unforgettable.",
      },
      { property: "og:title", content: "Traveloop — Design multi-city travel loops" },
      {
        property: "og:description",
        content:
          "Smart budgets, collaborative planning and live discovery for multi-city journeys.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Regions />
        <Trips />
        <Features />
        <Demo />
        <Community />
        <Signup />
      </main>
      <Footer />
      <PlanFab />
    </div>
  );
}
