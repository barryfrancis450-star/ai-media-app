import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2, Download, Image as ImageIcon } from "lucide-react";
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
  "Cinematic lighting"
];

export function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      size: "1024x1024",
      style: "",
    },
  });

  const generateMutation = useGenerateImage({
    mutation: {
      onSuccess: (data) => {
        setGeneratedImage(data);
        queryClient.invalidateQueries({ queryKey: getListGeneratedImagesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetImageStatsQueryKey() });
        toast({
          title: "Image generated successfully",
          description: "Your creation has been saved to the gallery.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to generate image",
          description: error.message || "An unexpected error occurred.",
        });
      },
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateMutation.mutate({ data: values });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create</h1>
        <p className="text-muted-foreground">Describe your vision and watch it come to life.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card/30 border border-border/50 p-6 rounded-2xl backdrop-blur-sm">
              
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A lone astronaut standing on a neon-lit cyber city street, rain falling..." 
                        className="resize-none h-32 bg-black/40 border-border/50 focus-visible:ring-primary/50 text-base"
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
                      <FormLabel className="text-foreground/80">Dimensions</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/40 border-border/50">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                          <SelectItem value="1536x1024">Landscape (1536x1024)</SelectItem>
                          <SelectItem value="1024x1536">Portrait (1024x1536)</SelectItem>
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
                      <FormLabel className="text-foreground/80">Style Hint</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional style..." className="bg-black/40 border-border/50" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Inspiration</p>
                <div className="flex flex-wrap gap-2">
                  {INSPIRATION_STYLES.map((style) => (
                    <Badge 
                      key={style}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors bg-white/5 border border-white/5"
                      onClick={() => form.setValue("style", style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-md mt-4 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                disabled={generateMutation.isPending}
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

        <div className="lg:col-span-7">
          <div className="h-full min-h-[400px] w-full rounded-2xl border border-border/50 bg-card/30 flex items-center justify-center overflow-hidden relative backdrop-blur-sm shadow-xl shadow-black/40">
            {generateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center space-y-6 w-full h-full p-8 absolute inset-0 z-10 bg-black/60 backdrop-blur-md animate-in fade-in">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-primary/40 animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-medium text-foreground tracking-tight animate-pulse">Computing Image</h3>
                  <p className="text-sm text-muted-foreground">Applying diffusion models...</p>
                </div>
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%', transformOrigin: 'left' }}></div>
                </div>
              </div>
            ) : null}

            {generatedImage ? (
              <div className="relative w-full h-full group">
                <img 
                  src={`data:image/png;base64,${generatedImage.b64_json}`} 
                  alt={generatedImage.prompt}
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm text-white/90 line-clamp-2 mb-3">{generatedImage.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-black/50 border-white/20 backdrop-blur-md">{generatedImage.size}</Badge>
                    <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-none" onClick={() => {
                      const a = document.createElement("a");
                      a.href = `data:image/png;base64,${generatedImage.b64_json}`;
                      a.download = `generated-${generatedImage.id}.png`;
                      a.click();
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              !generateMutation.isPending && (
                <div className="text-center space-y-4 text-muted-foreground p-8">
                  <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-foreground/70">Canvas empty</p>
                  <p className="text-sm max-w-sm mx-auto">Your generated image will appear here. Enter a prompt to begin the synthesis process.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
