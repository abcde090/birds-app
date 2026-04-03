import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, type PieLabelRenderProps } from 'recharts';
import { useBirdStore } from '../stores/useBirdStore';
import { CONSERVATION_LABELS, CONSERVATION_COLORS } from '../lib/constants';
import type { ConservationStatus } from '../types/bird';
import BirdGrid from '../components/birds/BirdGrid';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HomePage() {
  const birds = useBirdStore((s) => s.birds);

  const stats = useMemo(() => {
    const endangeredCount = birds.filter(
      (b) =>
        b.conservationStatus === 'critically_endangered' ||
        b.conservationStatus === 'endangered',
    ).length;
    const regionSet = new Set(birds.flatMap((b) => b.regions));
    const habitatSet = new Set(birds.flatMap((b) => b.habitats));
    return {
      total: birds.length,
      endangered: endangeredCount,
      regions: regionSet.size,
      habitats: habitatSet.size,
    };
  }, [birds]);

  const pieData = useMemo(() => {
    const counts: Partial<Record<ConservationStatus, number>> = {};
    birds.forEach((b) => {
      counts[b.conservationStatus] = (counts[b.conservationStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: CONSERVATION_LABELS[status as ConservationStatus],
      value: count,
      color: CONSERVATION_COLORS[status as ConservationStatus],
    }));
  }, [birds]);

  const featured = birds.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-eucalyptus-500 to-bark-900 py-24 px-4 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            className="font-serif text-5xl font-bold md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Discover Australia&apos;s Native Birds
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-sand-200 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Explore the unique and diverse avian wildlife of the Australian continent
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link
              to="/catalog"
              className="mt-8 inline-block rounded-lg bg-ochre-500 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-ochre-600"
            >
              Explore the Catalog
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section
        className="mx-auto -mt-8 max-w-4xl rounded-xl bg-white px-6 py-8 shadow-lg"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <AnimatedCounter value={stats.total} label="Total Species" />
          <AnimatedCounter value={stats.endangered} label="Endangered" />
          <AnimatedCounter value={stats.regions} label="Regions" />
          <AnimatedCounter value={stats.habitats} label="Habitats" />
        </div>
      </motion.section>

      {/* Featured birds */}
      <motion.section
        className="mx-auto max-w-7xl px-4 py-16"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-3xl font-bold text-bark-900 mb-8 text-center">
          Featured Species
        </h2>
        <BirdGrid birds={featured} />
        <div className="mt-8 text-center">
          <Link
            to="/catalog"
            className="text-sm font-medium text-eucalyptus-500 hover:underline"
          >
            View all species &rarr;
          </Link>
        </div>
      </motion.section>

      {/* Conservation overview */}
      {pieData.length > 0 && (
        <motion.section
          className="bg-sand-200 py-16 px-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-bark-900 mb-8">
              Conservation Overview
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={(props: PieLabelRenderProps) =>
                      `${props.name ?? ''} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
