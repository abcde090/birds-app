export default function Footer() {
  return (
    <footer className="bg-bark-900 text-sand-200 py-8 px-4">
      <div className="mx-auto max-w-7xl text-center space-y-2">
        <p className="font-serif text-lg">Australian Native Bird Explorer</p>
        <p className="text-sm text-sand-300">
          Data sourced from Atlas of Living Australia, eBird &amp; BirdLife Australia
        </p>
        <p className="text-xs text-bark-400">
          &copy; {new Date().getFullYear()} Aussie Birds. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
