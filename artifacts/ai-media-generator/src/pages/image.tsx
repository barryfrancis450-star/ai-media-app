import { motion } from "framer-motion";
import PromptBox from "@/components/PromptBox";

export function ImagePage() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">AI Image</h1>
        <p className="text-gray-400 mt-1">Describe your vision and watch it come to life.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <PromptBox />
      </motion.div>
    </div>
  );
}
