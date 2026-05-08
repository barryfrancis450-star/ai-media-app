import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Image as ImageIcon, Video, Mic } from "lucide-react";

const tools = [
  {
    label: "AI Image",
    description: "Generate stunning images from any text prompt",
    icon: ImageIcon,
    href: "/image",
    available: true,
  },
  {
    label: "AI Video",
    description: "Turn prompts into cinematic video clips",
    icon: Video,
    href: "/video",
    available: false,
  },
  {
    label: "AI Voice",
    description: "Generate realistic voiceovers from text",
    icon: Mic,
    href: "/voice",
    available: false,
  },
];

export function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="flex-1 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-purple-700 to-indigo-700 p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-4xl font-bold">Create without limits</h1>
        <p className="text-purple-200 mt-2">
          Generate AI images, videos, and more instantly
        </p>
        <button
          onClick={() => navigate("/image")}
          className="mt-6 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Creating
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {tools.map(({ label, description, icon: Icon, href, available }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            onClick={() => available && navigate(href)}
            className={`bg-zinc-900 border border-zinc-800 p-6 rounded-xl transition-all ${
              available
                ? "hover:scale-105 hover:border-purple-700/50 cursor-pointer"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">{label}</h2>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            {!available && (
              <span className="mt-3 inline-block text-xs bg-zinc-800 text-gray-500 px-2 py-1 rounded-md">
                Coming soon
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
