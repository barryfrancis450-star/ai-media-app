import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2, Download, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGenerateImage, getListGeneratedImagesQueryKey, getGetImageStatsQueryKey, GeneratedImage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  style: z.string().optional(),
});

const INSPIRATION_STYLES = [
  "Photorealistic",
  "Watercolor",
  "Oil painting",
  "Cyberpunk",
  "Studio Ghibli",
  "Architectural render",
  "Concept art",
  "Cinematic lighting",
];

export default function PromptBox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "", size: "1024x1024", style: "" },
  });

  const generateMutation = useGenerateImage({
    mutation: {
      onSuccess: (data) => {
        setGeneratedImage(data);
        queryClient.invalidateQueries({ queryKey: getListGeneratedImagesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetImageStatsQueryKey() });
        toast({ title: "Image generated", description: "Saved to your gallery." });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Generation failed", description: error.message });
      },
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateMutation.mutate({ data: values });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Form */}
      <div className="lg:col-span-5 space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A lone astronaut standing on a neon-lit cyber city street, rain falling..."
                      className="resize-none h-32 bg-black/40 border-white/10 focus-visible:ring-white/20 text-base text-white placeholder:text-white/30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Dimensions</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                        <SelectItem value="1536x1024">Landscape (1536×1024)</SelectItem>
                        <SelectItem value="1024x1536">Portrait (1024×1536)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Style Hint</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional style..."
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Inspiration</p>
              <div className="flex flex-wrap gap-2">
                {INSPIRATION_STYLES.map((style) => (
                  <Badge
                    key={style}
                    variant="secondary"
                    className="cursor-pointer hover:bg-white/20 hover:text-white transition-colors bg-white/5 border border-white/10 text-white/60"
                    onClick={() => form.setValue("style", style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98]"
              disabled={generateMutation.isPending}
              data-testid="generate-button"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Preview */}
      <div className="lg:col-span-7">
        <div className="h-full min-h-[400px] w-full rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative backdrop-blur-sm shadow-xl shadow-black/40">
          <AnimatePresence>
            {generateMutation.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-6 bg-black/70 backdrop-blur-md"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-violet-500/40 animate-pulse" />
                  <Loader2 className="h-16 w-16 animate-spin text-violet-400 relative z-10" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-medium text-white tracking-tight animate-pulse">Computing Image</h3>
                  <p className="text-sm text-white/40">Applying diffusion models...</p>
                </div>
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-500 rounded-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {generatedImage ? (
              <motion.div
                key={generatedImage.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full h-full group"
              >
                <img
                  src={`data:image/png;base64,${generatedImage.b64_json}`}
                  alt={generatedImage.prompt}
                  className="w-full h-full object-contain p-2"
                  data-testid="generated-image"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm text-white/80 line-clamp-2 mb-3">{generatedImage.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-black/50 border-white/20 text-white/70 backdrop-blur-md">
                      {generatedImage.size}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-none"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = `data:image/png;base64,${generatedImage.b64_json}`;
                        a.download = `generated-${generatedImage.id}.png`;
                        a.click();
                      }}
                      data-testid="download-button"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              !generateMutation.isPending && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-3 text-white/30 p-8"
                >
                  <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 opacity-40" />
                  </div>
                  <p className="text-lg font-medium text-white/50">Canvas empty</p>
                  <p className="text-sm max-w-xs mx-auto">Enter a prompt to begin the synthesis process.</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
