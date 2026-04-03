import { motion } from "framer-motion";

export default function ClosingSection() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <section
      className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-night-sky px-6 py-24 text-center"
      aria-label="Closing — conservation call to action"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
          Every species tells a story.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/60">
          Australia&apos;s birds are among the most diverse on Earth. Learning
          about them is the first step toward protecting them.
        </p>
        <button
          onClick={handleShare}
          className="mt-8 rounded-full bg-outback-gold px-8 py-3 font-semibold text-deep-bark transition-colors hover:bg-outback-orange hover:text-white"
        >
          Share this journey
        </button>
        <p className="mt-8 text-xs text-white/30">
          Data sourced from BirdLife Australia · Built with React &amp; Framer
          Motion
        </p>
      </motion.div>
    </section>
  );
}
