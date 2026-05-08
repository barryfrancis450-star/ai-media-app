import { motion } from "framer-motion";
import { Video } from "lucide-react";

export function VideoPage() {
  return (
    <div className="p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">AI Video</h1>
        <p className="text-gray-400 mt-1">Turn prompts into cinematic video clips.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-12 flex flex-col items-center justify-center text-center gap-4"
      >
        <div className="h-20 w-20 rounded-2xl bg-purple-600/10 border border-purple-700/30 flex items-center justify-center">
          <Video className="h-9 w-9 text-purple-400 opacity-60" />
        </div>
        <p className="text-lg font-medium text-white/60">Coming soon</p>
        <p className="text-sm text-gray-600 max-w-xs">
          Video generation is in development. Check back soon.
        </p>
      </motion.div>
    </div>
  );
}
