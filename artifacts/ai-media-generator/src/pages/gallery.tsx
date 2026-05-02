import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Image as ImageIcon, Search, PlusCircle, Maximize2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useListGeneratedImages,
  useGetImageStats,
  useDeleteGeneratedImage,
  getListGeneratedImagesQueryKey,
  getGetImageStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export function Gallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: images, isLoading: isImagesLoading } = useListGeneratedImages({
    query: { queryKey: getListGeneratedImagesQueryKey() },
  });

  const { data: stats, isLoading: isStatsLoading } = useGetImageStats({
    query: { queryKey: getGetImageStatsQueryKey() },
  });

  const deleteMutation = useDeleteGeneratedImage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGeneratedImagesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetImageStatsQueryKey() });
        toast({
          title: "Image removed",
          description: "The generation record has been deleted from your gallery.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to delete",
          description: "There was an error removing the record. Please try again.",
        });
      },
    },
  });

  const filteredImages = images?.filter((img) =>
    img.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">Your synthesized creations and historical generations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/50 border-border/50"
            />
          </div>
          <Link href="/">
            <Button className="shrink-0 shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              New
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/30 border-border/50 backdrop-blur-sm shadow-xl shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Total Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-10 w-24 bg-white/5" />
            ) : (
              <div className="text-4xl font-bold tracking-tighter">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/30 border-border/50 backdrop-blur-sm shadow-xl shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-green-500" /> Synthesized Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-10 w-24 bg-white/5" />
            ) : (
              <div className="text-4xl font-bold tracking-tighter">{stats?.today || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/50 backdrop-blur-sm shadow-xl shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-blue-400" /> Top Dimension
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-10 w-24 bg-white/5" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {stats?.bySize && Object.keys(stats.bySize).length > 0 
                  ? Object.entries(stats.bySize).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold border-b border-border/50 pb-4">Generation History</h2>
        
        {isImagesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : filteredImages?.length === 0 ? (
          <div className="text-center py-24 bg-card/20 rounded-xl border border-border/50 backdrop-blur-sm">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No records found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm ? "Try adjusting your search terms." : "You haven't generated any images yet."}
            </p>
            {!searchTerm && (
              <Link href="/">
                <Button className="mt-6" variant="secondary">Start Generating</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages?.map((img) => (
              <Card key={img.id} className="bg-card/40 border-border/50 overflow-hidden flex flex-col group transition-all hover:bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                <div className="aspect-square bg-black/60 border-b border-border/50 flex items-center justify-center relative p-6">
                  {/* Since list API doesn't return b64_json, we show a sleek placeholder */}
                  <ImageIcon className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-mono text-primary/80 truncate">ID: {img.id}</p>
                    <p className="text-xs text-white/60">Image payload absent from list API.</p>
                  </div>
                </div>
                <CardContent className="p-4 flex-1">
                  <p className="text-sm line-clamp-3 leading-snug">{img.prompt}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white/5 border-white/10 w-fit">{img.size}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(img.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border/50 shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Generation Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this record from your history. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate({ id: img.id })}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
